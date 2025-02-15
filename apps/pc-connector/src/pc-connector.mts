import { DetailedPeerCertificate } from 'node:tls';
import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { catchError, filter, finalize, first, Observable, of, timeout } from 'rxjs';

import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { Device } from '@computerclubsystem/types/entities/device.mjs';
import {
    CreateConnectedRedisClientOptions, RedisCacheClient, RedisClientMessageCallback, RedisPubClient, RedisSubClient
} from '@computerclubsystem/redis-client';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { createBusDeviceGetByCertificateRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-certificate-request.message.mjs';
import { createBusDeviceUnknownDeviceConnectedRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-unknown-device-connected-request.message.mjs';
import { BusDeviceGetByCertificateReplyMessage, BusDeviceGetByCertificateReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-device-get-by-certificate-reply.message.mjs';
import { MessageType } from '@computerclubsystem/types/messages/declarations/message-type.mjs';
import { BusDeviceStatusesMessage, DeviceStatus } from '@computerclubsystem/types/messages/bus/bus-device-statuses.message.mjs';
import { ConnectionRoundTripData } from '@computerclubsystem/types/messages/declarations/connection-roundtrip-data.mjs';
import { createBusDeviceConnectionEventMessage } from '@computerclubsystem/types/messages/bus/bus-device-connection-event.message.mjs';
import {
    ClientConnectedEventArgs, ConnectionClosedEventArgs, ConnectionErrorEventArgs,
    WssServerEventName, MessageReceivedEventArgs, WssServer, WssServerConfig
} from '@computerclubsystem/websocket-server';
import { ExitProcessManager, ProcessExitCode } from './exit-process-manager.mjs';
import { Logger } from './logger.mjs';
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { CertificateHelper } from './certificate-helper.mjs';
import { DeviceConnectionEventType } from '@computerclubsystem/types/entities/declarations/device-connection-event-type.mjs';
import { ConnectivityHelper } from './connectivity-helper.mjs';
import { BusDeviceConnectivityItem, createBusDeviceConnectivitiesNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-device-connectivities-notification.message.mjs';
import { createServerToDeviceCurrentStatusNotificationMessageMessage } from '@computerclubsystem/types/messages/devices/server-to-device-current-status-notification.message.mjs';
import { ServerToDeviceNotificationMessage } from '@computerclubsystem/types/messages/devices/declarations/server-to-device-notification-message.mjs';
import { createServerToDeviceDeviceConfigurationNotificationMessage, ServerToDeviceDeviceConfigurationNotificationMessageBody } from '@computerclubsystem/types/messages/devices/server-to-device-device-configuration-notification.message.mjs';
import { SubjectsService } from './subjects-service.mjs';
import { MessageStatItem } from './declarations.mjs';
import { DevicePartialMessage } from '@computerclubsystem/types/messages/devices/declarations/device-partial-message.mjs';
import { DeviceToServerNotificationMessageType } from '@computerclubsystem/types/messages/devices/declarations/device-to-server-notification-message-type.mjs';
import { DeviceToServerRequestMessageType } from '@computerclubsystem/types/messages/devices/declarations/device-to-server-request-message-type.mjs';
import { DeviceToServerStartOnPrepaidTariffRequestMessage } from '@computerclubsystem/types/messages/devices/device-to-server-start-on-prepaid-tariff-request.message.mjs';
import { createServerToDeviceStartOnPrepaidTariffReplyMessage } from '@computerclubsystem/types/messages/devices/server-to-device-start-on-prepaid-tariff-reply.message.mjs';
import { BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-start-device-on-prepaid-tariff-by-customer-reply.message.mjs';
import { createBusStartDeviceOnPrepaidTariffByCustomerRequestMessage } from '@computerclubsystem/types/messages/bus/bus-start-device-on-prepaid-tariff-by-customer-request.message.mjs';
import { ServerToDeviceReplyMessage } from '@computerclubsystem/types/messages/devices/declarations/server-to-device-reply-message.mjs';
import { DeviceToServerRequestMessage } from '@computerclubsystem/types/messages/devices/declarations/device-to-server-request-message.mjs';
import { DeviceToServerEndDeviceSessionByCustomerRequestMessage } from '@computerclubsystem/types/messages/devices/device-to-server-end-device-session-by-customer-request.message.mjs';
import { createBusEndDeviceSessionByCustomerRequestMessage } from '@computerclubsystem/types/messages/bus/bus-end-device-session-by-customer-request.message.mjs';
import { BusEndDeviceSessionByCustomerReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-end-device-session-by-customer-reply.message.mjs';
import { createServerToDeviceEndDeviceSessionByCustomerReplyMessage } from '@computerclubsystem/types/messages/devices/server-to-device-end-device-session-by-customer-reply.message.mjs';
import { ErrorHelper } from './error-helper.mjs';
import { DeviceToServerChangePrepaidTariffPasswordByCustomerRequestMessage } from '@computerclubsystem/types/messages/devices/device-to-server-change-prepaid-tariff-password-by-customer-request.message.mjs';
import { createBusChangePrepaidTariffPasswordByCustomerRequestMessage } from '@computerclubsystem/types/messages/bus/bus-change-prepaid-tariff-password-by-customer-request.message.mjs';
import { BusChangePrepaidTariffPasswordByCustomerReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-change-prepaid-tariff-password-by-customer-reply.message.mjs';
import { createServerToDeviceChangePrepaidTariffPasswordPasswordByCustomerReplyMessage } from '@computerclubsystem/types/messages/devices/server-to-device-change-prepaid-tariff-password-by-customer-reply.message.mjs';
import { createBusGetAllSystemSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings-request.message.mjs';
import { BusGetAllSystemSettingsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings-reply.message.mjs';
import { SystemSetting } from '@computerclubsystem/types/entities/system-setting.mjs';
import { BusAllSystemSettingsNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-all-system-settings-notification.message.mjs';
import { CacheHelper } from './cache-helper.mjs';
import { UdpHelper } from './udp-helper.mjs';
import { SystemSettingsName } from '@computerclubsystem/types/entities/system-setting-name.mjs';

export class PcConnector {
    wssServer!: WssServer;
    wssEmitter!: EventEmitter;
    desktopSwitchCounter = 0;
    connectedClients = new Map<number, ConnectedClientData>();

    private readonly envVars = new EnvironmentVariablesHelper().createEnvironmentVars();
    private state = this.createDefaultState();
    private readonly subClient = new RedisSubClient();
    private readonly pubClient = new RedisPubClient();
    private readonly cacheClient = new RedisCacheClient();
    private readonly cacheHelper = new CacheHelper();
    private readonly udpHelper = new UdpHelper();
    private readonly messageBusIdentifier = 'ccs3/pc-connector';
    private logger = new Logger();
    private exitProcessManager = new ExitProcessManager();
    private readonly certificateHelper = new CertificateHelper();
    private readonly connectivityHelper = new ConnectivityHelper();
    private readonly errorHelper = new ErrorHelper();
    private readonly subjectsService = new SubjectsService();

    async start(): Promise<void> {
        this.cacheHelper.initialize(this.cacheClient);
        this.exitProcessManager.setLogger(this.logger);
        this.exitProcessManager.init();
        await this.joinMessageBus();
        this.requestAllSystemSettings();
        this.startWebSocketServer();
        this.startClientConnectionsMonitor();
        this.startMainTimer();
    }

    applySystemSettings(systemSettings: SystemSetting[]): void {
        // TODO: Generate objects based on provided system settings
        const allConnectedClientsData = this.getAllConnectedClientsData();
        const msg = createServerToDeviceDeviceConfigurationNotificationMessage();
        msg.body = this.createServerToDeviceDeviceConfigurationNotificationMessageBody(systemSettings);
        for (const data of allConnectedClientsData) {
            this.sendNotificationMessageToDevice(msg, data.connectionId);
        }
    }

    requestAllSystemSettings(): void {
        const busReqMsg = createBusGetAllSystemSettingsRequestMessage();
        this.publishToSharedChannelAndWaitForReply<BusGetAllSystemSettingsReplyMessageBody>(busReqMsg, null)
            .subscribe(replyMsg => {
                if (!replyMsg.header.failure) {
                    this.state.systemSettings = replyMsg.body.systemSettings;
                    // Generate objects based on system settings
                    this.applySystemSettings(this.state.systemSettings);
                }
            });
    }

    private processDeviceConnected(args: ClientConnectedEventArgs): void {
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

        const clientData: ConnectedClientData = {
            connectionId: args.connectionId,
            connectedAt: this.getNowAsNumber(),
            deviceId: null,
            device: null,
            certificate: args.certificate,
            certificateThumbprint: this.getLowercasedCertificateThumbprint(clientCertificateFingerprint),
            ipAddress: args.ipAddress,
            lastMessageReceivedAt: null,
            receivedMessagesCount: 0,
            // isAuthenticated: false,
        };
        this.connectedClients.set(args.connectionId, clientData);
        const msg = createBusDeviceGetByCertificateRequestMessage();
        // const roundTripData: ConnectionRoundTripData = {
        //     connectionId: clientData.connectionId,
        //     certificateThumbprint: clientData.certificateThumbprint,
        //     ipAddress: args.ipAddress,
        // };
        // msg.header.roundTripData = roundTripData;
        msg.body.certificateThumbprint = clientData.certificateThumbprint;
        this.publishToDevicesChannelAndWaitForReply<BusDeviceGetByCertificateReplyMessageBody>(msg, clientData)
            .subscribe(busReplyMsg => this.processDeviceGetByCertificateReply(busReplyMsg, clientData));
    }

    private processDeviceMessageReceived(args: MessageReceivedEventArgs): void {
        const clientData = this.getConnectedClientData(args.connectionId);
        if (!clientData) {
            this.logger.warn('Message is received by connection ID ', args.connectionId, 'which is not found as active.', `. Can't process the message`);
            return;
        }
        this.connectivityHelper.setDeviceMessageReceived(clientData.certificateThumbprint, clientData.deviceId, clientData.device?.name);
        clientData.lastMessageReceivedAt = this.getNowAsNumber();
        let msg: DevicePartialMessage<any> | null;
        try {
            msg = this.deserializeWebSocketBufferToMessage(args.buffer);
            this.logger.log(
                'Received message from device connection', args.connectionId,
                ', device Id', clientData.deviceId,
                ', IP address', clientData.ipAddress,
                ', message', msg,
            );
            const type = msg?.header?.type;
            if (!msg || !type) {
                this.logger.warn('The message does not have type', msg);
                return;
            }
        } catch (err) {
            this.logger.warn(`Can't deserialize device connection message`, args, err);
            return;
        }

        this.processDeviceMessage(msg, clientData);
    }

    processDeviceMessage(message: DevicePartialMessage<any>, clientData: ConnectedClientData): void {
        const type = message.header.type;
        switch (type) {
            case DeviceToServerRequestMessageType.changePrepaidTariffPasswordByCustomer: {
                this.processDeviceToServerChangePrepaidTariffPasswordByCustomerRequestMessage(message as DeviceToServerChangePrepaidTariffPasswordByCustomerRequestMessage, clientData);
                break;
            }
            case DeviceToServerRequestMessageType.endDeviceSessionByCustomer: {
                this.processDeviceToServerEndDeviceSessionByCustomerRequestMessage(message as DeviceToServerEndDeviceSessionByCustomerRequestMessage, clientData);
                break;
            }
            case DeviceToServerRequestMessageType.startOnPrepaidTariff: {
                this.processDeviceToServerStartOnPrepaidTariffRequestMessage(message as DeviceToServerStartOnPrepaidTariffRequestMessage, clientData);
                break;
            }
            case DeviceToServerNotificationMessageType.ping: {
                break;
            }
        }
    }

    processDeviceToServerChangePrepaidTariffPasswordByCustomerRequestMessage(message: DeviceToServerChangePrepaidTariffPasswordByCustomerRequestMessage, clientData: ConnectedClientData): void {
        const busReqMsg = createBusChangePrepaidTariffPasswordByCustomerRequestMessage();
        busReqMsg.body.deviceId = clientData.deviceId!;
        busReqMsg.body.currentPasswordHash = message.body.currentPasswordHash;
        busReqMsg.body.newPasswordHash = message.body.newPasswordHash;
        this.publishToDevicesChannelAndWaitForReply<BusChangePrepaidTariffPasswordByCustomerReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const replyMsg = createServerToDeviceChangePrepaidTariffPasswordPasswordByCustomerReplyMessage();
                this.errorHelper.setBusMessageFailure(busReplyMsg, message, replyMsg);
                this.sendReplyMessageToDevice(replyMsg, message, clientData.connectionId);
            });
    }

    processDeviceToServerEndDeviceSessionByCustomerRequestMessage(message: DeviceToServerEndDeviceSessionByCustomerRequestMessage, clientData: ConnectedClientData): void {
        const busReqMsg = createBusEndDeviceSessionByCustomerRequestMessage();
        busReqMsg.body.deviceId = clientData.deviceId!;
        this.publishToDevicesChannelAndWaitForReply<BusEndDeviceSessionByCustomerReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const replyMsg = createServerToDeviceEndDeviceSessionByCustomerReplyMessage();
                this.errorHelper.setBusMessageFailure(busReplyMsg, message, replyMsg);
                this.sendReplyMessageToDevice(replyMsg, message, clientData.connectionId);
            });
    }

    processDeviceToServerStartOnPrepaidTariffRequestMessage(message: DeviceToServerStartOnPrepaidTariffRequestMessage, clientData: ConnectedClientData): void {
        const busReqMsg = createBusStartDeviceOnPrepaidTariffByCustomerRequestMessage();
        busReqMsg.body.deviceId = clientData.deviceId!;
        busReqMsg.body.passwordHash = message.body.passwordHash;
        busReqMsg.body.tariffId = message.body.tariffId;
        this.publishToDevicesChannelAndWaitForReply<BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const replyMsg = createServerToDeviceStartOnPrepaidTariffReplyMessage();
                replyMsg.body.alreadyInUse = busReplyMsg.body.alreadyInUse;
                replyMsg.body.notAllowed = busReplyMsg.body.notAllowed;
                replyMsg.body.passwordDoesNotMatch = busReplyMsg.body.passwordDoesNotMatch;
                replyMsg.body.remainingSeconds = busReplyMsg.body.remainingSeconds;
                replyMsg.body.success = busReplyMsg.body.success;
                replyMsg.header.failure = busReplyMsg.header.failure;
                this.sendReplyMessageToDevice(replyMsg, message, clientData.connectionId);
            });
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
                this.processSharedBusMessage(message);
                break;
        }
    }

    processSharedBusMessage<TBody>(message: Message<TBody>): void {
        this.subjectsService.setSharedChannelBusMessageReceived(message);
        const type = message.header.type;
        switch (type) {
            case MessageType.busAllSystemSettingsNotification:
                this.processBusAllSystemSettingsNotificationMessage(message as BusAllSystemSettingsNotificationMessage);
                break;
        }
    }

    processBusAllSystemSettingsNotificationMessage(message: BusAllSystemSettingsNotificationMessage): void {
        this.state.systemSettings = message.body.systemSettings;
        this.applySystemSettings(this.state.systemSettings);
    }

    processDevicesBusMessage<TBody>(message: Message<TBody>): void {
        this.subjectsService.setDevicesChannelBusMessageReceived(message);
        const type = message.header.type;
        // Process only notification messages. Reply message should be processed by the caller
        switch (type) {
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
                    const msg = createServerToDeviceCurrentStatusNotificationMessageMessage();
                    msg.body.started = status.started;
                    // TODO: ? Also return the tariff name ?
                    msg.body.tariffId = status.tariff;
                    msg.body.canBeStoppedByCustomer = status.canBeStoppedByCustomer;
                    msg.body.amounts = {
                        expectedEndAt: status.expectedEndAt,
                        remainingSeconds: status.remainingSeconds,
                        startedAt: status.startedAt,
                        stoppedAt: status.stoppedAt,
                        totalSum: status.totalSum,
                        totalTime: status.totalTime,
                    };
                    try {
                        this.sendNotificationMessageToDevice(msg, connectionId);
                    } catch (err) {
                        this.logger.warn(`Can't send to device`, connectionId, msg, err);
                    }
                }
            }
        }
        try {
            this.processBusDeviceStatusesMessageForNoCertificateDevices(deviceStatuses);
        } catch (err) {
            this.logger.error(`Can't process no-certificate devices`, err);
        }
    }

    async processBusDeviceStatusesMessageForNoCertificateDevices(deviceStatuses: DeviceStatus[]): Promise<void> {
        // TODO: Try to not load devices every time - load them on start-up and also add notification from state-manager when devices are changed
        const allDevices = await this.cacheHelper.getAllDevices();
        if (!allDevices) {
            return;
        }

        const devicesWithoutCertificateThumbprints = allDevices.filter(x => x.enabled && x.approved && !x.certificateThumbprint && x.description);
        for (const noCertDevice of devicesWithoutCertificateThumbprints) {
            const deviceStatus = deviceStatuses.find(x => x.deviceId === noCertDevice.id);
            if (deviceStatus) {
                // Device status always exists
                const desc = noCertDevice.description || '';
                const descLines = desc.split('\n');
                const trimmedLines = descLines.map(x => x.trim());
                let packetToSend: string | undefined;
                let port: number;
                if (deviceStatus.started) {
                    // Must be started - find StartPacket
                    const startPacketLine = trimmedLines.find(x => x.startsWith('StartPacket='));
                    if (startPacketLine) {
                        const parts = startPacketLine.split('=');
                        packetToSend = parts[1].trim();
                    }
                } else {
                    // Must be stopped - find StopPacket
                    const stopPacketLine = trimmedLines.find(x => x.startsWith('StopPacket='));
                    if (stopPacketLine) {
                        const parts = stopPacketLine.split('=');
                        packetToSend = parts[1].trim();
                    }
                }
                const portLine = trimmedLines.find(x => x.startsWith('Port='));
                if (portLine) {
                    const portParts = portLine.split('=');
                    port = +(portParts[1].trim());
                }
                if (packetToSend && (packetToSend.length % 2) === 0) {
                    const buffer = this.hexStringToBuffer(packetToSend);
                    try {
                        this.udpHelper.send(buffer, port!, noCertDevice.ipAddress);
                    } catch (err) {
                        this.logger.warn(`Can't send UDP packet ${packetToSend} to ${noCertDevice.ipAddress}:${port!}. Error: ${err}`);
                    }
                } else {
                    // Packet to send is not valid   
                }
            }
        }
    }

    hexStringToBuffer(hexString: string): Buffer {
        const arr: number[] = [];
        for (let i = 0; i < hexString.length - 1; i += 2) {
            const hex = hexString.substring(i, i + 2);
            arr.push(parseInt(hex, 16));
        }
        return Buffer.from(arr);
    }

    processDeviceGetByCertificateReply(message: BusDeviceGetByCertificateReplyMessage, clientData: ConnectedClientData): void {
        const device: Device = message.body.device;
        const connectionId = clientData.connectionId;
        // const roundTripData = message.header.roundTripData as ConnectionRoundTripData;
        // const connectionId = roundTripData.connectionId;
        if (!device) {
            // Device with specified certificate does not exist
            this.sendBusDeviceUnknownDeviceConnectedRequestMessage(clientData.ipAddress, connectionId, clientData.certificateThumbprint);
            return;
        }

        if (!device?.approved || !device?.enabled) {
            this.logger.warn('The device is not active. Closing connection. Device', device?.id, clientData);
            this.removeClient(connectionId);
            this.wssServer.closeConnection(connectionId);
            return;
        }

        this.publishDeviceConnectionEventMessage(device.id, clientData.ipAddress, DeviceConnectionEventType.connected);

        // Attach websocket server to connection so we receive events
        const connectionExist = this.wssServer.attachToConnection(connectionId);
        if (!connectionExist) {
            this.removeClient(connectionId);
            return;
        }
        clientData.deviceId = device.id;
        clientData.device = device;
        this.sendDeviceMessageDeviceConfiguration(connectionId);
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
        const msg = createServerToDeviceDeviceConfigurationNotificationMessage();
        // TODO: Get configuration from the database
        msg.body = this.createServerToDeviceDeviceConfigurationNotificationMessageBody(this.state.systemSettings);
        this.sendNotificationMessageToDevice(msg, connectionId);
    }

    private createServerToDeviceDeviceConfigurationNotificationMessageBody(systemSettings: SystemSetting[]): ServerToDeviceDeviceConfigurationNotificationMessageBody {
        let result: ServerToDeviceDeviceConfigurationNotificationMessageBody = {} as ServerToDeviceDeviceConfigurationNotificationMessageBody;
        if (!(systemSettings?.length > 0)) {
            result = {
                pingInterval: 10000,
                secondsAfterStoppedBeforeRestart: 180,
            };
            return result;
        }

        const secondsBeforeRestartingStoppedComputersValue = systemSettings.find(x => x.name === SystemSettingsName.seconds_before_restarting_stopped_computers)?.value;
        result = {
            secondsAfterStoppedBeforeRestart: secondsBeforeRestartingStoppedComputersValue ? +secondsBeforeRestartingStoppedComputersValue : 180,
            // TODO: Define pingInterval system setting
            pingInterval: 10000,
        };
        return result;
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

    private getAllConnectedClientsData(): ConnectedClientData[] {
        return Array.from(this.connectedClients.values());
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

    // private sendToDevice<TBody>(message: Message<TBody>, connectionId: number): void {
    //     this.logger.log('Sending message to device connection', connectionId, message);
    //     this.wssServer.sendJSON(message, connectionId);
    // }

    private sendNotificationMessageToDevice<TBody>(message: ServerToDeviceNotificationMessage<TBody>, connectionId: number): void {
        this.logger.log('Sending notification message to device connection', connectionId, message);
        this.wssServer.sendJSON(message, connectionId);
    }

    private sendReplyMessageToDevice<TBody>(message: ServerToDeviceReplyMessage<TBody>, requestMessage: DeviceToServerRequestMessage<any>, connectionId: number): void {
        this.logger.log('Sending reply message to device connection', connectionId, message);
        message.header.correlationId = requestMessage.header.correlationId;
        if (message.header.failure) {
            // Not sure what the requestType is
            // message.header.requestType = requestMessage?.header?.type;
        }
        message.header.correlationId = requestMessage.header.correlationId;
        this.wssServer.sendJSON(message, connectionId);
    }

    publishToDevicesChannelAndWaitForReply<TReplyBody>(busMessage: Message<any>, clientData: ConnectedClientData): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            channel: ChannelName.devices,
            completedAt: 0,
            deviceId: clientData.deviceId,
        };
        if (!busMessage.header.correlationId) {
            busMessage.header.correlationId = this.createUUIDString();
        }
        messageStatItem.correlationId = busMessage.header.correlationId;
        return this.publishToDevicesChannel(busMessage).pipe(
            filter(msg => !!msg.header.correlationId && msg.header.correlationId === busMessage.header.correlationId),
            first(),
            timeout(this.state.messageBusReplyTimeout),
            catchError(err => {
                messageStatItem.error = err;
                // TODO: This will complete the observable. The subscriber will not know about the error/timeout
                return of();
            }),
            finalize(() => {
                messageStatItem.completedAt = this.getNowAsNumber();
                this.subjectsService.setChannelMessageStat(messageStatItem);
            }),
        );
    }

    publishToSharedChannelAndWaitForReply<TReplyBody>(busMessage: Message<any>, clientData: ConnectedClientData | null): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            channel: ChannelName.shared,
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            completedAt: 0,
            deviceId: clientData?.deviceId,
        };
        if (!busMessage.header.correlationId) {
            busMessage.header.correlationId = this.createUUIDString();
        }
        messageStatItem.correlationId = busMessage.header.correlationId;
        return this.publishToSharedChannel(busMessage).pipe(
            filter(msg => !!msg.header.correlationId && msg.header.correlationId === busMessage.header.correlationId),
            first(),
            timeout(this.state.messageBusReplyTimeout),
            catchError(err => {
                messageStatItem.error = err;
                // TODO: This will complete the observable. The subscriber will not know about the error/timeout
                return of();
            }),
            finalize(() => {
                messageStatItem.completedAt = this.getNowAsNumber();
                this.subjectsService.setChannelMessageStat(messageStatItem);
            }),
        );
    }

    // private async publishToDevicesChannel<TBody>(message: Message<TBody>): Promise<void> {
    //     this.publishToChannel(message, ChannelName.devices);
    // }

    private publishToDevicesChannel<TBody>(message: Message<TBody>): Observable<Message<any>> {
        this.publishToChannel(message, ChannelName.devices);
        return this.subjectsService.getDevicesChannelBusMessageReceived();
    }

    private publishToSharedChannel<TBody>(message: Message<TBody>): Observable<Message<any>> {
        this.publishToChannel(message, ChannelName.shared);
        return this.subjectsService.getSharedChannelBusMessageReceived();
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

    getNowAsNumber(): number {
        return Date.now();
    }

    createUUIDString(): string {
        return randomUUID().toString();
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

        await this.connectCacheClient(redisHost!, redisPort!);
    }

    async connectCacheClient(redisHost: string, redisPort: number): Promise<void> {
        const redisCacheClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.logger.error('CacheClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                this.logger.error('CacheClient reconnect strategy error', retries, err);
                return 5000;
            },
        };
        this.logger.log('CacheClient connecting');
        await this.cacheClient.connect(redisCacheClientOptions);
        this.logger.log('CacheClient connected');
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
            // All devices connecting to pc-connector must provide certificate signed with the same CA as the one provided in caCert
            requestCert: true,
            rejectUnauthorized: true,
        };
        this.wssServer.start(wssServerConfig);
        this.wssEmitter = this.wssServer.getEmitter();
        this.wssEmitter.on(WssServerEventName.clientConnected, args => this.processDeviceConnected(args));
        this.wssEmitter.on(WssServerEventName.connectionClosed, args => this.processClientConnectionClosed(args));
        this.wssEmitter.on(WssServerEventName.connectionError, args => this.processClientConnectionError(args));
        this.wssEmitter.on(WssServerEventName.messageReceived, args => this.processDeviceMessageReceived(args));
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
        const now = this.getNowAsNumber();
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
        const now = this.getNowAsNumber();
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
            lastConnectivitySnapshotTimestamp: this.getNowAsNumber(),
            connectivitySnapshotInterval: 10000,
            messageBusReplyTimeout: 5000,
            systemSettings: [],
        };
        return state;
    }

    private getLowercasedCertificateThumbprint(certificateFingerprint?: string | null): string {
        if (!certificateFingerprint) {
            return '';
        }
        return certificateFingerprint.replaceAll(':', '').toLowerCase();
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

    messageBusReplyTimeout: number;

    systemSettings: SystemSetting[];
}
