import { DetailedPeerCertificate } from 'node:tls';
import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';

import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { Device } from '@computerclubsystem/types/entities/device.mjs';
import {
    CreateConnectedRedisClientOptions, RedisClientMessageCallback, RedisPubClient, RedisSubClient
} from '@computerclubsystem/redis-client';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { createBusDeviceGetByCertificateRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-certificate-request.message.mjs';
import { createBusDeviceUnknownDeviceConnectedRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-unknown-device-connected-request.message.mjs';
import { BusDeviceGetByCertificateReplyMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-certificate-reply.message.mjs';
import { MessageType } from '@computerclubsystem/types/messages/declarations/message-type.mjs';
import { RoundTripData } from '@computerclubsystem/types/messages/declarations/round-trip-data.mjs';
import { BusDeviceStatusesMessage, DeviceStatus } from '@computerclubsystem/types/messages/bus/bus-device-statuses.message.mjs';
import { createDeviceSetStatusMessage } from '@computerclubsystem/types/messages/devices/device-set-status.message.mjs';
import { ConnectionRoundTripData } from '@computerclubsystem/types/messages/declarations/connection-roundtrip-data.mjs';
import { createDeviceConfigurationMessage } from '@computerclubsystem/types/messages/devices/device-configuration.message.mjs';
import { BusDeviceConnectionEventMessageBody, createBusDeviceConnectionEventMessage } from '@computerclubsystem/types/messages/bus/bus-device-connection-event.message.mjs';
import {
    ClientConnectedEventArgs, ConnectionClosedEventArgs, ConnectionErrorEventArgs,
    WssServerEventName, MessageReceivedEventArgs, WssServer, WssServerConfig
} from '@computerclubsystem/websocket-server';
import { ExitProcessManager, ProcessExitCode } from './exit-process-manager.mjs';
import { Logger } from './logger.mjs';
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { CertificateHelper, CertificateIssuerSubjectInfo } from './certificate-helper.mjs';
import { DeviceConnectionEventType } from '@computerclubsystem/types/entities/declarations/device-connection-event-type.mjs';
import { ConnectivityHelper } from './connectivity-helper.mjs';
import { BusDeviceConnectivityItem, createBusDeviceConnectivitiesNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-device-connectivities-notification.message.mjs';

export class PcConnector {
    wssServer!: WssServer;
    wssEmitter!: EventEmitter;
    desktopSwitchCounter = 0;
    connectedClients = new Map<number, ConnectedClientData>();

    private readonly envVars = new EnvironmentVariablesHelper().createEnvironmentVars();
    private state = this.createDefaultState();
    private readonly subClient = new RedisSubClient();
    private readonly pubClient = new RedisPubClient();
    private readonly messageBusIdentifier = 'ccs3/pc-connector';
    private logger = new Logger();
    private exitProcessManager = new ExitProcessManager();
    private issuerSubjectInfo!: CertificateIssuerSubjectInfo;
    private readonly certificateHelper = new CertificateHelper();
    private readonly connectivityHelper = new ConnectivityHelper();

    async start(): Promise<void> {
        this.issuerSubjectInfo = this.certificateHelper.createIssuerSubjectInfo(this.envVars.CCS3_CA_ISSUER_CERTIFICATE_SUBJECT.value!);
        this.exitProcessManager.setLogger(this.logger);
        this.exitProcessManager.init();
        await this.joinMessageBus();
        this.startWebSocketServer();
        this.startClientConnectionsMonitor();
        this.startMainTimer();
    }

    private processClientConnected(args: ClientConnectedEventArgs): void {
        this.logger.log('Client connected', args);
        const clientCertificateFingerprint = this.getLowercasedCertificateThumbprint(args.certificate?.fingerprint);
        if (clientCertificateFingerprint) {
            this.connectivityHelper.setDeviceConnected(clientCertificateFingerprint, args.certificate);
        }
        if (!args.ipAddress || !clientCertificateFingerprint) {
            // The args.ipAddress can be undefined if the client already closed the connection
            this.logger.warn(
                'The client ip address is missing (client disconnected ?) or the certificate does not have fingerprint.',
                'IP address:',
                args.ipAddress,
                ', Certificate thumbprint:',
                args.certificate?.fingerprint,
                ', Connection Id:', args.connectionId
            );
            this.wssServer.closeConnection(args.connectionId);
            return;
        }
        const clientCertificateIssuer = args.certificate.issuer;
        const issuerMatches = this.certificateHelper.issuerMatches(clientCertificateIssuer, this.issuerSubjectInfo);
        if (!issuerMatches) {
            this.logger.warn('The client certificate issuer', clientCertificateIssuer, 'does not match the one configured in environment variable', this.envVars.CCS3_CA_ISSUER_CERTIFICATE_SUBJECT, this.issuerSubjectInfo);
            this.wssServer.closeConnection(args.connectionId);
            return;
        }

        const data: ConnectedClientData = {
            connectionId: args.connectionId,
            connectedAt: this.getNow(),
            deviceId: null,
            device: null,
            certificate: args.certificate,
            certificateThumbprint: this.getLowercasedCertificateThumbprint(clientCertificateFingerprint),
            ipAddress: args.ipAddress,
            lastMessageReceivedAt: null,
            receivedMessagesCount: 0,
            // isAuthenticated: false,
        };
        this.connectedClients.set(args.connectionId, data);
        const msg = createBusDeviceGetByCertificateRequestMessage();
        const roundTripData: ConnectionRoundTripData = {
            connectionId: data.connectionId,
            certificateThumbprint: data.certificateThumbprint,
            ipAddress: args.ipAddress,
        };
        msg.header.roundTripData = roundTripData;
        msg.body.certificateThumbprint = data.certificateThumbprint;
        this.publishToDevicesChannel(msg);
    }

    private getLowercasedCertificateThumbprint(certificateFingerprint?: string | null): string {
        if (!certificateFingerprint) {
            return '';
        }
        return certificateFingerprint.replaceAll(':', '').toLowerCase();
    }

    private processClientConnectionClosed(args: ConnectionClosedEventArgs): void {
        this.logger.log('Device connection closed', args);
        // Check if we still have this connection before saving connection event - it might be already removed because of timeout
        const clientData = this.getConnectedClientData(args.connectionId);
        if (clientData) {
            this.connectivityHelper.setDeviceDisconnected(clientData.certificateThumbprint);
            if (clientData?.deviceId) {
                this.connectivityHelper.setDeviceDisconnected(clientData.certificateThumbprint);
                const note = `Code: ${args.code}, connection id: ${args.connectionId}`;
                this.publishDeviceConnectionEventMessage(clientData.deviceId, clientData.ipAddress, DeviceConnectionEventType.disconnected, note);
            }
        }
        this.removeClient(args.connectionId);
    }

    private processClientConnectionError(args: ConnectionErrorEventArgs): void {
        this.logger.warn('Device connection error', args);
        const clientData = this.getConnectedClientData(args.connectionId);
        if (clientData?.deviceId) {
            this.publishDeviceConnectionEventMessage(clientData.deviceId, clientData.ipAddress, DeviceConnectionEventType.connectionError);
        }
        this.removeClient(args.connectionId);
    }

    private processClientMessageReceived(args: MessageReceivedEventArgs): void {
        const clientData = this.getConnectedClientData(args.connectionId);
        if (!clientData) {
            this.logger.warn('Message is received by connection ID ', args.connectionId, 'which is not found as active.', `. Can't process the message`);
            return;
        }
        this.connectivityHelper.setDeviceMessageReceived(clientData.certificateThumbprint, clientData.deviceId, clientData.device?.name);
        clientData.lastMessageReceivedAt = this.getNow();
        let msg: Message<any> | null;
        let type: MessageType | undefined;
        try {
            msg = this.deserializeWebSocketBufferToMessage(args.buffer);
            this.logger.log(
                'Received message from device connection', args.connectionId,
                ', device Id', clientData.deviceId,
                ', IP address', clientData.ipAddress,
                ', message', msg,
            );
            type = msg?.header?.type;
            if (!type) {
                this.logger.warn('The message does not have type', msg);
                return;
            }
        } catch (err) {
            this.logger.warn(`Can't deserialize device connection message`, args, err);
            return;
        }

        switch (type) {
        }

        // switch (type) {
        //     case MessageType....:
        //         this.process...Message(msg, args.connectionId);
        //         break;
        // }
    }

    processBusMessageReceived(channelName: string, message: Message<any>): void {
        if (this.isOwnMessage(message)) {
            return;
        }
        this.logger.log('Received bus message', message.header.type, 'on channel', channelName, 'message', message);
        const type = message.header.type;
        if (!type) {
            return;
        }

        switch (channelName) {
            case ChannelName.devices:
                this.processDevicesBusMessage(message);
                break;
            case ChannelName.shared:
                break;
        }
    }

    processDevicesBusMessage<TBody>(message: Message<TBody>): void {
        const type = message.header.type;
        switch (type) {
            case MessageType.busDeviceGetByCertificateReply:
                this.processDeviceGetByCertificateReply(message as BusDeviceGetByCertificateReplyMessage);
                break;
            case MessageType.busDeviceStatuses:
                this.processDeviceStatusesMessage(message as BusDeviceStatusesMessage);
                break;
        }
    }

    processDeviceStatusesMessage(message: BusDeviceStatusesMessage): void {
        this.sendStatusToDevices(message.body.deviceStatuses);
    }

    sendStatusToDevices(deviceStatuses: DeviceStatus[]): void {
        for (const status of deviceStatuses) {
            const connections = this.getConnectedClientsDataByDeviceId(status.deviceId);
            if (connections.length > 0) {
                for (const connection of connections) {
                    const connectionId = connection[0];
                    const msg = createDeviceSetStatusMessage();
                    msg.body.started = status.started;
                    // TODO: Also return the tariff name
                    msg.body.amounts = {
                        expectedEndAt: status.expectedEndAt,
                        remainingSeconds: status.remainingSeconds,
                        startedAt: status.startedAt,
                        stoppedAt: status.stoppedAt,
                        totalSum: status.totalSum,
                        totalTime: status.totalTime,
                    };
                    try {
                        this.sendToDevice(msg, connectionId);
                    } catch (err) {
                        this.logger.warn(`Can't send to device`, connectionId, msg, err);
                    }
                }
            }
        }
    }

    processDeviceGetByCertificateReply(message: BusDeviceGetByCertificateReplyMessage): void {
        const device: Device = message.body.device;
        const roundTripData = message.header.roundTripData as ConnectionRoundTripData;
        const connectionId = roundTripData.connectionId;
        if (!device) {
            // Device with specified certificate does not exist
            this.sendBusDeviceUnknownDeviceConnectedRequestMessage(roundTripData.ipAddress, roundTripData.connectionId, roundTripData.certificateThumbprint);
            return;
        }

        if (!device?.approved || !device?.enabled) {
            this.logger.warn('The device is not active. Closing connection. Device', device?.id, roundTripData);
            this.removeClient(connectionId);
            this.wssServer.closeConnection(connectionId);
            return;
        }

        this.publishDeviceConnectionEventMessage(device.id, roundTripData.ipAddress, DeviceConnectionEventType.connected);

        // Attach websocket server to connection so we receive events
        const connectionExist = this.wssServer.attachToConnection(connectionId);
        if (!connectionExist) {
            this.removeClient(connectionId);
            return;
        }
        const clientData = this.getConnectedClientData(connectionId);
        if (clientData) {
            clientData.deviceId = device.id;
            clientData.device = device;
            this.sendDeviceMessageDeviceConfiguration(clientData.connectionId);
        }
    }

    private publishDeviceConnectionEventMessage(deviceId: number, ipAddress: string, eventType: DeviceConnectionEventType, note?: string): void {
        const deviceConnectionEventMsg = createBusDeviceConnectionEventMessage();
        deviceConnectionEventMsg.body = {
            ...deviceConnectionEventMsg.body,
            deviceId: deviceId,
            ipAddress: ipAddress,
            note: note,
            type: eventType,
        };
        this.publishToDevicesChannel(deviceConnectionEventMsg);
    }

    private sendDeviceMessageDeviceConfiguration(connectionId: number): void {
        const msg = createDeviceConfigurationMessage();
        msg.body.pingInterval = 10000;
        this.sendToDevice(msg, connectionId);
    }

    private sendBusDeviceUnknownDeviceConnectedRequestMessage(ipAddress: string, connectionId: number, certificateThumbprint: string): void {
        const msg = createBusDeviceUnknownDeviceConnectedRequestMessage();
        const roundTripData: ConnectionRoundTripData = {
            connectionId: connectionId,
            certificateThumbprint: certificateThumbprint,
            ipAddress: ipAddress,
        };
        msg.header.roundTripData = roundTripData;
        msg.body.certificateThumbprint = certificateThumbprint;
        msg.body.ipAddress = ipAddress;
        const data = this.getConnectedClientData(connectionId);
        if (data?.certificate) {
            msg.body.certificateSubject = this.certificateHelper.createStringFromCertificateSubject(data.certificate.subject);
            msg.body.certificateCommonName = data.certificate.subject.CN;
        }
        this.publishToDevicesChannel(msg);
    }

    private getConnectedClientData(connectionId: number): ConnectedClientData | undefined {
        return this.connectedClients.get(connectionId);
    }

    private getConnectedClientsDataByDeviceId(deviceId: number): [number, ConnectedClientData][] {
        const result: [number, ConnectedClientData][] = [];
        for (const item of this.connectedClients.entries()) {
            const data = item[1];
            if (data.deviceId === deviceId) {
                result.push(item);
            }
        }
        return result;
    }

    private removeClient(connectionId: number): void {
        this.connectedClients.delete(connectionId);
    }

    isOwnMessage<TBody>(message: Message<TBody>): boolean {
        return (message.header.source === this.messageBusIdentifier);
    }

    deserializeWebSocketBufferToMessage(buffer: Buffer): Message<any> | null {
        const text = buffer.toString();
        const json = JSON.parse(text);
        return json as Message<any>;
    }

    deserializeBusMessageToMessage(text: string): Message<any> | null {
        const json = JSON.parse(text);
        return json as Message<any>;
    }

    private sendToDevice<TBody>(message: Message<TBody>, connectionId: number): void {
        this.logger.log('Sending message to device connection', connectionId, message);
        this.wssServer.sendJSON(message, connectionId);
    }

    private async publishToDevicesChannel<TBody>(message: Message<TBody>): Promise<void> {
        this.publishToChannel(message, ChannelName.devices);
    }

    private async publishToSharedChannel<TBody>(message: Message<TBody>): Promise<void> {
        this.publishToChannel(message, ChannelName.shared);
    }

    private async publishToChannel<TBody>(message: Message<TBody>, channelName: ChannelName): Promise<void> {
        message.header.source = this.messageBusIdentifier;
        this.logger.log('Publishing message', channelName, message.header.type, message);
        try {
            const publishResult = await this.pubClient.publish(channelName, JSON.stringify(message));
            this.state.pubClientPublishErrorsCount = 0;
        } catch (err) {
            this.state.pubClientPublishErrorsCount++;
            this.logger.warn('Cannot publish message to channel', channelName, 'Message', message);
            this.logger.warn('PubClient publish errors count', this.state.pubClientPublishErrorsCount, '. Maximum allowed', this.state.maxAllowedPubClientPublishErrorsCount);
            if (this.state.pubClientPublishErrorsCount > this.state.maxAllowedPubClientPublishErrorsCount) {
                this.exitProcessManager.exitProcess(ProcessExitCode.maxPubClientPublishErrorsReached);
            }
        }
    }

    getNow(): number {
        return Date.now();
    }

    private async joinMessageBus(): Promise<void> {
        const redisHost = this.envVars.CCS3_REDIS_HOST.value;
        const redisPort = this.envVars.CCS3_REDIS_PORT.value;
        this.logger.log('Using redis host', redisHost, 'and port', redisPort);

        let receivedMessagesCount = 0;
        const subClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.processSubClientError(err),
            reconnectStrategyCallback: (retries: number, err: Error) => this.processSubClientReconnectStrategyError(retries, err),
        };
        const subClientMessageCallback: RedisClientMessageCallback = (channelName, message) => {
            receivedMessagesCount++;
            try {
                const messageJson = this.deserializeBusMessageToMessage(message);
                if (messageJson) {
                    this.processBusMessageReceived(channelName, messageJson);
                } else {
                    this.logger.warn('The message', message, 'deserialized to null');
                }
            } catch (err) {
                this.logger.warn('Cannot deserialize channel', channelName, 'message', message, err);
            }
        };
        this.logger.log('SubClient connecting to Redis');
        await this.subClient.connect(subClientOptions, subClientMessageCallback);
        this.logger.log('SubClient connected to Redis');
        await this.subClient.subscribe(ChannelName.shared);
        await this.subClient.subscribe(ChannelName.devices);
        this.logger.log('SubClient subscribed to the channels');

        const pubClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.logger.error('PubClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                this.logger.error('PubClient reconnect strategy error', retries, err);
                return 5000;
            },
        };
        this.logger.log('PubClient connecting to Redis');
        await this.pubClient.connect(pubClientOptions);
        this.logger.log('PubClient connected to Redis');
    }

    private processSubClientError(error: any): void {
        this.logger.error('SubClient error', error);
        this.state.subClientErrorsCount++;
        this.logger.warn('SubClient errors count:', this.state.subClientErrorsCount, 'Maximum allowed:', this.state.maxAllowedSubClientErrorsCount);
        if (this.state.subClientErrorsCount > this.state.maxAllowedSubClientErrorsCount) {
            this.exitProcessManager.exitProcess(ProcessExitCode.maxSubClentErrorsReached);
        }
    }

    /**
     * 
     * @param retries The number of reconnect retries performed so far
     * @param err The error
     * @returns The number of milliseconds to wait before the next reconnect attempt
     */
    private processSubClientReconnectStrategyError(retries: number, err: Error): number {
        // TODO: Count failures and exit the process if specific amount is reached
        this.logger.error('SubClient reconnect strategy error', retries, err);
        this.state.subClientReconnectionErrorsCount++;
        this.logger.warn('SubClient reconnection errors count:', this.state.subClientReconnectionErrorsCount, 'Maximum allowed:', this.state.maxAllowedSubClientReconnectionErrorsCount);
        if (this.state.subClientReconnectionErrorsCount > this.state.maxAllowedSubClientReconnectionErrorsCount) {
            this.exitProcessManager.exitProcess(ProcessExitCode.maxSubClientReconnectErrorsReached);
        }
        return 5000;
    }

    private startWebSocketServer(): void {
        this.wssServer = new WssServer();
        const wssServerConfig: WssServerConfig = {
            cert: fs.readFileSync(this.envVars.CCS3_PC_CONNECTOR_CERTIFICATE_CRT_FILE_PATH.value!).toString(),
            key: fs.readFileSync(this.envVars.CCS3_PC_CONNECTOR_CERTIFICATE_KEY_FILE_PATH.value!).toString(),
            caCert: fs.readFileSync(this.envVars.CCS3_PC_CONNECTOR_ISSUER_CERTIFICATE_CRT_FILE_PATH.value!).toString(),
            port: this.envVars.CCS3_PC_CONNECTOR_PORT.value!,
        };
        this.wssServer.start(wssServerConfig);
        this.wssEmitter = this.wssServer.getEmitter();
        this.wssEmitter.on(WssServerEventName.clientConnected, args => this.processClientConnected(args));
        this.wssEmitter.on(WssServerEventName.connectionClosed, args => this.processClientConnectionClosed(args));
        this.wssEmitter.on(WssServerEventName.connectionError, args => this.processClientConnectionError(args));
        this.wssEmitter.on(WssServerEventName.messageReceived, args => this.processClientMessageReceived(args));
    }

    private startClientConnectionsMonitor(): void {
        this.state.clientConnectionsMonitorTimerHandle = setInterval(() => this.cleanUpClientConnections(), 10000);
    }

    private startMainTimer(): void {
        setInterval(() => this.processMainTimerTick(), 1000);
    }

    processMainTimerTick(): void {
        this.processConnectivityData();
    }

    private processConnectivityData(): void {
        const now = this.getNow();
        const diff = now - this.state.lastConnectivitySnapshotTimestamp;
        if (diff > this.state.connectivitySnapshotInterval) {
            this.state.lastConnectivitySnapshotTimestamp = now;
            const snapshot = this.connectivityHelper.getSnapshot();
            if (snapshot.length > 0) {
                const busConnectivityItems: BusDeviceConnectivityItem[] = [];
                for (const snapshotItem of snapshot) {
                    const busItem: BusDeviceConnectivityItem = {
                        certificateThumbprint: snapshotItem.certificateThumbprint,
                        connectionsCount: snapshotItem.connectionsCount,
                        lastConnectionSince: snapshotItem.lastConnectionSince,
                        secondsSinceLastConnected: this.getDiffInSeconds(now, snapshotItem.lastConnectionSince),
                        lastMessageSince: snapshotItem.lastMessageSince,
                        secondsSinceLastMessage: snapshotItem.lastMessageSince ? this.getDiffInSeconds(now, snapshotItem.lastMessageSince) : undefined,
                        messagesCount: snapshotItem.messagesCount,
                        deviceId: snapshotItem.deviceId,
                        deviceName: snapshotItem.deviceName,
                        isConnected: snapshotItem.isConnected,
                    };
                    busConnectivityItems.push(busItem);
                }
                const busMsg = createBusDeviceConnectivitiesNotificationMessage();
                busMsg.body.connectivityItems = busConnectivityItems;
                this.publishToDevicesChannel(busMsg);
            }
        }
    }

    getDiffInSeconds(now: number, otherValue: number): number {
        const seconds = Math.floor((now - otherValue) / 1000)
        return seconds;
    }

    private cleanUpClientConnections(): void {
        const connectionIdsWithCleanUpReason = new Map<number, ConnectionCleanUpReason>();
        const now = this.getNow();
        // 20 seconds
        // const maxNotAuthenticatedDuration = 20 * 1000;
        const maxIdleTimeoutDuration = 20 * 1000;
        for (const entry of this.connectedClients.entries()) {
            const connectionId = entry[0];
            const data = entry[1];
            // // Devices are authenticating with certificates
            // if (!data.isAuthenticated && (now - data.connectedAt) > maxNotAuthenticatedDuration) {
            //     connectionIdsWithCleanUpReason.set(connectionId, ConnectionCleanUpReason.authenticationTimeout);
            // }
            // Add other conditions
            if (data.lastMessageReceivedAt) {
                if ((now - data.lastMessageReceivedAt) > maxIdleTimeoutDuration) {
                    connectionIdsWithCleanUpReason.set(connectionId, ConnectionCleanUpReason.idleTimeout);
                }
            } else {
                // Never received message at this connection - use the time of connection
                if ((now - data.connectedAt) > maxIdleTimeoutDuration) {
                    connectionIdsWithCleanUpReason.set(connectionId, ConnectionCleanUpReason.noMessagesReceived);
                }
            }
        }

        for (const entry of connectionIdsWithCleanUpReason.entries()) {
            const connectionId = entry[0];
            const data = this.getConnectedClientData(connectionId);
            this.logger.warn('Disconnecting client', connectionId, entry[1], data);
            if (data) {
                this.connectivityHelper.setDeviceDisconnected(data.certificateThumbprint);
                if (data.deviceId) {
                    this.publishDeviceConnectionEventMessage(data.deviceId, data.ipAddress, DeviceConnectionEventType.idleTimeout, entry[1].toString());
                }
            }
            this.removeClient(connectionId);
            this.wssServer.closeConnection(connectionId);
        }
    }

    private createDefaultState(): PcConnectorState {
        // TODO: Get values from environment
        const state: PcConnectorState = {
            pubClientConnectionErrorsCount: 0,
            maxAllowedPubClientConnectionErrorsCount: 50,
            pubClientReconnectionErrorsCount: 0,
            maxAllowedPubClientReconnectionErrorsCount: 50,
            subClientErrorsCount: 0,
            maxAllowedSubClientErrorsCount: 50,
            subClientReconnectionErrorsCount: 0,
            maxAllowedSubClientReconnectionErrorsCount: 50,
            pubClientPublishErrorsCount: 0,
            maxAllowedPubClientPublishErrorsCount: 10,
            clientConnectionsMonitorTimerHandle: undefined,
            mainTimerHandle: undefined,
            lastConnectivitySnapshotTimestamp: this.getNow(),
            connectivitySnapshotInterval: 10000,
        };
        return state;
    }

    async terminate(): Promise<void> {
        this.logger.warn('Terminating');
        clearInterval(this.state.clientConnectionsMonitorTimerHandle);
        clearInterval(this.state.mainTimerHandle);
        this.wssServer.stop();
        await this.subClient.disconnect();
        await this.pubClient.disconnect();
    }
}

interface ConnectedClientData {
    connectionId: number;
    connectedAt: number;
    /**
     * Device ID in the system
     */
    deviceId: number | null;
    /**
     * The device entity
     */
    device: Device | null;
    /**
     * The client certificate
     */
    certificate: DetailedPeerCertificate | null;
    /**
     * certificate.fingeprint without the colon separator and lowercased
     */
    certificateThumbprint: string;
    ipAddress: string;
    lastMessageReceivedAt: number | null;
    receivedMessagesCount: number;
    // /**
    //  * Whether the client is authenticated to use the system
    //  * While the system checks the client, it will not send messages to the client or process messages from it
    //  */
    // isAuthenticated: boolean;
}

const enum ConnectionCleanUpReason {
    // authenticationTimeout = 'authentication-timeout',
    idleTimeout = 'idle-timeout',
    noMessagesReceived = 'no-messages-received',
}

interface PcConnectorState {
    pubClientConnectionErrorsCount: number;
    maxAllowedPubClientConnectionErrorsCount: number;
    pubClientReconnectionErrorsCount: number;
    maxAllowedPubClientReconnectionErrorsCount: number;

    subClientErrorsCount: number;
    maxAllowedSubClientErrorsCount: number;
    subClientReconnectionErrorsCount: number;
    maxAllowedSubClientReconnectionErrorsCount: number;

    pubClientPublishErrorsCount: number;
    maxAllowedPubClientPublishErrorsCount: number;

    clientConnectionsMonitorTimerHandle?: NodeJS.Timeout;
    mainTimerHandle?: NodeJS.Timeout;

    lastConnectivitySnapshotTimestamp: number;
    connectivitySnapshotInterval: number;
}
