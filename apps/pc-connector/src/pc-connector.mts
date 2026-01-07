import { DetailedPeerCertificate } from 'node:tls';
import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import { URL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { catchError, filter, finalize, first, firstValueFrom, Observable, of, timeout } from 'rxjs';

import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { Device } from '@computerclubsystem/types/entities/device.mjs';
import {
    CreateConnectedRedisClientOptions, RedisCacheClient, RedisClientMessageCallback, RedisPubClient, RedisSubClient
} from '@computerclubsystem/redis-client';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { createBusDeviceGetByCertificateRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-certificate.messages.mjs';
import { createBusDeviceUnknownDeviceConnectedRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-unknown-device-connected.messages.mjs';
import { BusDeviceGetByCertificateReplyMessage, BusDeviceGetByCertificateReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-device-get-by-certificate.messages.mjs';
import { MessageType } from '@computerclubsystem/types/messages/declarations/message-type.mjs';
import { BusDeviceStatusesNotificationMessage, DeviceStatus } from '@computerclubsystem/types/messages/bus/bus-device-statuses-notification.message.mjs';
import { ConnectionRoundTripData } from '@computerclubsystem/types/messages/declarations/connection-roundtrip-data.mjs';
import { createBusDeviceConnectionEventNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-device-connection-event-notification.message.mjs';
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
import { CodeSignIn, MessageStatItem } from './declarations.mjs';
import { DevicePartialMessage } from '@computerclubsystem/types/messages/devices/declarations/device-partial-message.mjs';
import { DeviceToServerNotificationMessageType } from '@computerclubsystem/types/messages/devices/declarations/device-to-server-notification-message-type.mjs';
import { DeviceToServerRequestMessageType } from '@computerclubsystem/types/messages/devices/declarations/device-to-server-request-message-type.mjs';
import { DeviceToServerStartOnPrepaidTariffRequestMessage, DeviceToServerStartOnPrepaidTariffRequestMessageBody } from '@computerclubsystem/types/messages/devices/device-to-server-start-on-prepaid-tariff-request.message.mjs';
import { createServerToDeviceStartOnPrepaidTariffReplyMessage } from '@computerclubsystem/types/messages/devices/server-to-device-start-on-prepaid-tariff-reply.message.mjs';
import { BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-start-device-on-prepaid-tariff-by-customer.messages.mjs';
import { createBusStartDeviceOnPrepaidTariffByCustomerRequestMessage } from '@computerclubsystem/types/messages/bus/bus-start-device-on-prepaid-tariff-by-customer.messages.mjs';
import { ServerToDeviceReplyMessage } from '@computerclubsystem/types/messages/devices/declarations/server-to-device-reply-message.mjs';
import { DeviceToServerRequestMessage } from '@computerclubsystem/types/messages/devices/declarations/device-to-server-request-message.mjs';
import { DeviceToServerEndDeviceSessionByCustomerRequestMessage } from '@computerclubsystem/types/messages/devices/device-to-server-end-device-session-by-customer-request.message.mjs';
import { createBusEndDeviceSessionByCustomerRequestMessage } from '@computerclubsystem/types/messages/bus/bus-end-device-session-by-customer.messages.mjs';
import { BusEndDeviceSessionByCustomerReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-end-device-session-by-customer.messages.mjs';
import { createServerToDeviceEndDeviceSessionByCustomerReplyMessage } from '@computerclubsystem/types/messages/devices/server-to-device-end-device-session-by-customer-reply.message.mjs';
import { ErrorHelper } from './error-helper.mjs';
import { DeviceToServerChangePrepaidTariffPasswordByCustomerRequestMessage } from '@computerclubsystem/types/messages/devices/device-to-server-change-prepaid-tariff-password-by-customer-request.message.mjs';
import { createBusChangePrepaidTariffPasswordByCustomerRequestMessage } from '@computerclubsystem/types/messages/bus/bus-change-prepaid-tariff-password-by-customer.messages.mjs';
import { BusChangePrepaidTariffPasswordByCustomerReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-change-prepaid-tariff-password-by-customer.messages.mjs';
import { createServerToDeviceChangePrepaidTariffPasswordPasswordByCustomerReplyMessage } from '@computerclubsystem/types/messages/devices/server-to-device-change-prepaid-tariff-password-by-customer-reply.message.mjs';
import { createBusGetAllSystemSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings.messages.mjs';
import { BusGetAllSystemSettingsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings.messages.mjs';
import { SystemSetting } from '@computerclubsystem/types/entities/system-setting.mjs';
import { BusAllSystemSettingsNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-all-system-settings-notification.message.mjs';
import { CacheHelper } from './cache-helper.mjs';
import { UdpHelper } from './udp-helper.mjs';
import { SystemSettingsName } from '@computerclubsystem/types/entities/system-setting-name.mjs';
import { TariffShortInfo } from '@computerclubsystem/types/entities/tariff.mjs';
import { BusFilterServerLogsNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-filter-server-logs-notification.message.mjs';
import { FilterServerLogsItem } from '@computerclubsystem/types/messages/shared-declarations/filter-server-logs-item.mjs';
import { BusShutdownStoppedRequestMessage, createBusShutdownStoppedReplyMessage } from '@computerclubsystem/types/messages/bus/bus-shutdown-stopped.messages.mjs';
import { BusGetDeviceStatusesReplyMessageBody, createBusGetDeviceStatusesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-statuses.messages.mjs';
import { createServerToDeviceShutdownNoitificationMessage } from '@computerclubsystem/types/messages/devices/server-to-device-shutdown-notification.message.mjs';
import { transferSharedMessageData } from '@computerclubsystem/types/messages/utils.mjs';
import { BusRestartDevicesRequestMessage, createBusRestartDevicesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-restart-devices.messages.mjs';
import { createServerToDeviceRestartNoitificationMessage } from '@computerclubsystem/types/messages/devices/server-to-device-restart-notification.message.mjs';
import { BusGetDeviceConnectivityDetailsRequestMessage, createBusGetDeviceConnectivityDetailsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-connectivity-details.messages.mjs';
import { BusShutdownDevicesRequestMessage, createBusShutdownDevicesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-shutdown-devices.messages.mjs';
import { DeviceConnectivityConnectionEventType } from '@computerclubsystem/types/messages/shared-declarations/device-connectivity-types.mjs';
import { DeviceToServerCreateSignInCodeRequestMessage } from '@computerclubsystem/types/messages/devices/device-to-server-create-sign-in-code-request.message.mjs';
import { createServerToDeviceCreateSignInCodeReplyMessage } from '@computerclubsystem/types/messages/devices/server-to-device-create-sign-in-code-reply.message.mjs';
import { DeviceMessageError } from '@computerclubsystem/types/messages/devices/declarations/device-message-error.mjs';
import { DeviceMessageErrorCode } from '@computerclubsystem/types/messages/devices/declarations/device-message-error-code.mjs';
import { BusCodeSignInIdentifierType } from '@computerclubsystem/types/messages/bus/declarations/bus-code-sign-in-identifier-type.mjs';
import { BusGetSignInCodeInfoRequestMessage, createBusGetSignInCodeInfoReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-sign-in-code-info.messages.mjs';
import { BusCodeSignInWithCredentialsRequestMessage, createBusCodeSignInWithCredentialsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-code-sign-in-with-credentials.messages.mjs';
import { BusCodeSignInErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-code-sign-in-error-code.mjs';
import { DeviceToServerRequestMessageHeader } from '@computerclubsystem/types/messages/devices/declarations/device-to-server-request-message-header.mjs';
import { LongLivedAccessToken } from '@computerclubsystem/types/entities/long-lived-access-token.mjs';
import { BusErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-error-code.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { BusCreateLongLivedAccessTokenForTariffReplyMessageBody, createBusCreateLongLivedAccessTokenForTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-long-lived-access-token-for-tariff.messages.mjs';
import { BusCodeSignInWithLongLivedAccessTokenRequestMessage, createBusCodeSignInWithLongLivedAccessTokenReplyMessage } from '@computerclubsystem/types/messages/bus/bus-code-sign-in-with-long-lived-access-token.messages.mjs';

export class PcConnector {
    wssServer!: WssServer;
    wssEmitter!: EventEmitter;
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
        this.state.isQrCodeSignInFeatureEnabled = systemSettings.find(x => x.name === SystemSettingsName.feature_qrcode_sign_in_enabled)?.value?.trim() === 'yes';
        const secondPriceSystemSetting = systemSettings.find(x => x.name === SystemSettingsName.feature_second_price);
        this.state.isSecondPriceFeatureEnabled = !!secondPriceSystemSetting?.value?.trim();
        if (this.state.isSecondPriceFeatureEnabled) {
            const secondPriceSystemSettingValue = secondPriceSystemSetting!.value!;
            const parts = secondPriceSystemSettingValue.trim().split(',');
            const secondPriceRate = +parts[1];
            const isSecondPriceRateValid = secondPriceRate > 0;
            if (isSecondPriceRateValid) {
                this.state.secondPriceCurrency = parts[1];
                this.state.secondPriceRate = secondPriceRate;
            } else {
                this.state.isSecondPriceFeatureEnabled = false;
            }
        }
        if (!this.state.isSecondPriceFeatureEnabled) {
            this.state.secondPriceCurrency = null;
            this.state.secondPriceRate = null;
        }
        const allConnectedClientsData = this.getAllConnectedClientsData();
        const msg = createServerToDeviceDeviceConfigurationNotificationMessage();
        msg.body = this.createServerToDeviceDeviceConfigurationNotificationMessageBody(systemSettings);
        for (const data of allConnectedClientsData) {
            this.sendNotificationMessageToDevice(msg, data);
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
        if (!args.ipAddress || !clientCertificateFingerprint) {
            // The args.ipAddress can be undefined if the client already closed the connection
            this.logger.warn(
                'The client ip address is missing (client disconnected ?) or the certificate does not have fingerprint.',
                'IP address:', args.ipAddress,
                ', Certificate thumbprint:', args.certificate?.fingerprint,
                ', Connection Id:', args.connectionId
            );
            this.wssServer.closeConnection(args.connectionId);
            return;
        }

        const connectionInstanceId = this.createUUIDString();
        this.connectivityHelper.setDeviceConnected(clientCertificateFingerprint, args, connectionInstanceId);
        const clientData: ConnectedClientData = {
            connectionId: args.connectionId,
            connectionInstanceId: connectionInstanceId,
            connectedAt: this.getNowAsNumber(),
            deviceId: null,
            device: null,
            certificate: args.certificate,
            certificateThumbprint: this.getLowercasedCertificateThumbprint(clientCertificateFingerprint),
            ipAddress: args.ipAddress,
            lastMessageReceivedAt: null,
            receivedMessagesCount: 0,
            lastMessageSentAt: null,
            sentMessagesCount: 0,
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
        this.processConnectivityData(true);
    }

    private processDeviceMessageReceived(args: MessageReceivedEventArgs): void {
        const clientData = this.getConnectedClientData(args.connectionId);
        if (!clientData) {
            this.logger.warn('Message is received by connection ID ', args.connectionId, 'which is not found as active.', `. Can't process the message`);
            return;
        }
        this.connectivityHelper.setDeviceMessageReceived(clientData.certificateThumbprint, clientData.deviceId, clientData.device?.name);
        clientData.lastMessageReceivedAt = this.getNowAsNumber();
        clientData.receivedMessagesCount++;
        let msg: DevicePartialMessage<unknown> | null;
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

    processDeviceMessage(message: DevicePartialMessage<unknown>, clientData: ConnectedClientData): void {
        const type = message.header.type;
        switch (type) {
            case DeviceToServerRequestMessageType.createSignInCode: {
                this.processDeviceToServerCreateSignInCodeRequestMessage(message as DeviceToServerCreateSignInCodeRequestMessage, clientData);
                break;
            }
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

    async processDeviceToServerCreateSignInCodeRequestMessage(message: DeviceToServerCreateSignInCodeRequestMessage, clientData: ConnectedClientData): Promise<void> {
        const replyMsg = createServerToDeviceCreateSignInCodeReplyMessage();
        if (!this.state.isQrCodeSignInFeatureEnabled) {
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: DeviceMessageErrorCode.qrCodeSignFeatureIsNotEnabled,
                description: 'QR code sign in feature is not enabled',
            }] as DeviceMessageError[];
            this.sendReplyMessageToDevice(replyMsg, message, clientData);
            return;
        }
        const qrCodeServerUrl = this.state.systemSettings.find(x => x.name === SystemSettingsName.feature_qrcode_sign_in_server_public_url)?.value?.trim();
        const canParseUrl = URL.canParse(qrCodeServerUrl!);
        if (!canParseUrl) {
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: DeviceMessageErrorCode.qrCodeSignInFeatureUrlIsNotCorrect,
                description: 'QR code sign in feature URL is not correct. It must start with https://',
            }];
            this.sendReplyMessageToDevice(replyMsg, message, clientData);
            return;
        }

        const code = this.createUUIDString();
        const createdAt = this.getNowAsNumber();
        const codeSignIn: CodeSignIn = {
            code: code,
            connectionInstanceId: clientData.connectionInstanceId,
            createdAt: createdAt,
        };
        try {
            await this.cacheHelper.setCodeSignIn(codeSignIn);
            replyMsg.body.code = codeSignIn.code;
            replyMsg.body.remainingSeconds = this.state.codeSignInDurationSeconds;
            const url = URL.parse(qrCodeServerUrl!)!;
            url.searchParams.append('sign-in-code', codeSignIn.code);
            url.searchParams.append('identifier-type', BusCodeSignInIdentifierType.customerCard);
            replyMsg.body.url = url.toString();
            replyMsg.body.identifierType = BusCodeSignInIdentifierType.customerCard;
        } catch (err) {
            this.logger.error('Error at processOperatorCreateSignInCodeRequestMessage', err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: DeviceMessageErrorCode.internalServerError,
                description: 'Internal server error',
            }];
        }
        this.sendReplyMessageToDevice(replyMsg, message, clientData);
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
                this.sendReplyMessageToDevice(replyMsg, message, clientData);
            });
    }

    processDeviceToServerEndDeviceSessionByCustomerRequestMessage(message: DeviceToServerEndDeviceSessionByCustomerRequestMessage, clientData: ConnectedClientData): void {
        const busReqMsg = createBusEndDeviceSessionByCustomerRequestMessage();
        busReqMsg.body.deviceId = clientData.deviceId!;
        this.publishToDevicesChannelAndWaitForReply<BusEndDeviceSessionByCustomerReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const replyMsg = createServerToDeviceEndDeviceSessionByCustomerReplyMessage();
                this.errorHelper.setBusMessageFailure(busReplyMsg, message, replyMsg);
                this.sendReplyMessageToDevice(replyMsg, message, clientData);
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
                replyMsg.body.noRemainingTime = busReplyMsg.body.noRemainingTime;
                replyMsg.body.notAvailableForThisDeviceGroup = busReplyMsg.body.notAvailableForThisDeviceGroup;
                replyMsg.body.success = busReplyMsg.body.success;
                replyMsg.header.failure = busReplyMsg.header.failure;
                this.sendReplyMessageToDevice(replyMsg, message, clientData);
            });
    }

    private processClientConnectionClosed(args: ConnectionClosedEventArgs): void {
        this.logger.log('Device connection closed', args);
        // Check if we still have this connection before saving connection event - it might be already removed because of timeout
        const data = this.getConnectedClientData(args.connectionId);
        if (data) {
            const connectedAt = new Date(data.connectedAt).toISOString();
            const lastMessageReceivedAt = new Date(data.lastMessageReceivedAt || 0).toISOString();
            const lastMessageSentAt = new Date(data.lastMessageSentAt || 0).toISOString();
            const reasonText = `Code: ${args.code}, Connection ${data.connectionId}/${data.connectionInstanceId}, Connected at ${connectedAt}, Last message received at ${lastMessageReceivedAt}, Received messages count ${data.receivedMessagesCount}, Last message sent at ${lastMessageSentAt}, Sent messages count ${data.sentMessagesCount}`;
            this.connectivityHelper.setDeviceDisconnected(data.certificateThumbprint, data.connectionId, data.connectionInstanceId, DeviceConnectivityConnectionEventType.disconnected, reasonText);
            if (data.deviceId) {
                this.publishDeviceConnectionEventMessage(data.deviceId, data.ipAddress, DeviceConnectionEventType.disconnected, reasonText);
            }
        }
        this.removeClient(args.connectionId);
        this.processConnectivityData(true);
    }

    private processClientConnectionError(args: ConnectionErrorEventArgs): void {
        this.logger.warn('Device connection error', args);
        const clientData = this.getConnectedClientData(args.connectionId);
        if (clientData?.deviceId) {
            this.publishDeviceConnectionEventMessage(clientData.deviceId, clientData.ipAddress, DeviceConnectionEventType.connectionError);
        }
        this.removeClient(args.connectionId);
    }

    processBusMessageReceived(channelName: string, message: Message<unknown>): void {
        if (this.isOwnMessage(message)) {
            return;
        }
        this.logger.log(`Received bus message '${message.header.type}' on channel ${channelName}`, message);
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
            case MessageType.busCodeSignInWithLongLivedAccessTokenRequest:
                this.processBusCodeSignInWithLongLivedAccessTokenRequestMessage(message as BusCodeSignInWithLongLivedAccessTokenRequestMessage);
                break;
            case MessageType.busCodeSignInWithCredentialsRequest:
                this.processBusCodeSignInWithCredentialsRequestMessage(message as BusCodeSignInWithCredentialsRequestMessage);
                break;
            case MessageType.busGetSignInCodeInfoRequest:
                this.processBusGetSignInCodeInfoRequestMessage(message as BusGetSignInCodeInfoRequestMessage);
                break;
            case MessageType.busFilterServerLogsNotification:
                this.processBusFilterServerLogsNotificationMessage(message as BusFilterServerLogsNotificationMessage);
                break;
            case MessageType.busAllSystemSettingsNotification:
                this.processBusAllSystemSettingsNotificationMessage(message as BusAllSystemSettingsNotificationMessage);
                break;
        }
    }

    async processBusCodeSignInWithLongLivedAccessTokenRequestMessage(message: BusCodeSignInWithLongLivedAccessTokenRequestMessage): Promise<void> {
        // TODO: This function logic will not work if we have multiple service instances, because the message is sent to all of them
        if (!message.body.code || !message.body.token || message.body.identifierType !== BusCodeSignInIdentifierType.customerCard) {
            return;
        }
        const replyMsg = createBusCodeSignInWithLongLivedAccessTokenReplyMessage();
        replyMsg.header.correlationId = message.header.correlationId;
        const cacheItem = await this.cacheHelper.getCodeSignIn(message.body.code);
        if (!cacheItem) {
            replyMsg.body.success = false;
            replyMsg.body.errorMessage = 'Code not found';
            replyMsg.body.errorCode = BusCodeSignInErrorCode.codeNotFound;
            replyMsg.header.failure = true;
            this.publishToSharedChannel(replyMsg);
            return;
        }
        const now = this.getNowAsNumber();
        if ((now - cacheItem.createdAt) > this.state.codeSignInDurationSeconds * 1000) {
            replyMsg.body.success = false;
            replyMsg.body.errorMessage = 'Code has expired';
            replyMsg.body.errorCode = BusCodeSignInErrorCode.codeHasExpired;
            replyMsg.header.failure = true;
            this.publishToSharedChannel(replyMsg);
            return;
        }

        const connectedClientsWithConnectionInstanceId = this.getConnectedClientsDataBy(x => x.connectionInstanceId === cacheItem.connectionInstanceId);
        if (connectedClientsWithConnectionInstanceId.length === 0) {
            // TODO: This will not work if we have multiple instances of pc-connector
            //       It might be that another instance owns the connectionInstanceId
            replyMsg.body.success = false;
            replyMsg.body.errorMessage = 'Connection has expired';
            replyMsg.body.errorCode = BusCodeSignInErrorCode.connectionExpired;
            replyMsg.header.failure = true;
            this.publishToSharedChannel(replyMsg);
            return;
        }
        // We expect only one item with specified connectionInstanceId
        const clientData = connectedClientsWithConnectionInstanceId[0];
        try {
            // Auth the user with long lived access token
            const busUserAuthWithLongLivedAccessTokenReq = createBusStartDeviceOnPrepaidTariffByCustomerRequestMessage();
            busUserAuthWithLongLivedAccessTokenReq.body.token = message.body.token;
            busUserAuthWithLongLivedAccessTokenReq.body.deviceId = clientData.deviceId!;
            busUserAuthWithLongLivedAccessTokenReq.body.ipAddress = message.body.ipAddress;
            const busRes = await firstValueFrom(this.publishToDevicesChannelAndWaitForReply<BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody>(busUserAuthWithLongLivedAccessTokenReq, clientData));
            if (busRes.header.failure || !busRes.body.success) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = busRes.header.errors;
                replyMsg.body.success = false;
                this.publishToSharedChannel(replyMsg);
                return;
            }
            replyMsg.body.success = true;
            replyMsg.body.identifier = `${busRes.body.tariffId}`;
            replyMsg.body.remainingSeconds = busRes.body.remainingSeconds;
            replyMsg.body.identifierType = BusCodeSignInIdentifierType.customerCard;
            await this.cacheHelper.deleteCodeSignIn(message.body.code);
            this.publishToSharedChannel(replyMsg);
        } catch (err) {
            this.logger.error(`Can't get long lived access token`, err);
            replyMsg.body.success = false;
            replyMsg.body.errorCode = BusCodeSignInErrorCode.serverError;
            replyMsg.body.errorMessage = 'Server error';
            replyMsg.header.failure = true;
            this.publishToSharedChannel(replyMsg);
            return;
        }
    }

    async processBusCodeSignInWithCredentialsRequestMessage(message: BusCodeSignInWithCredentialsRequestMessage): Promise<void> {
        // TODO: This function logic will not work if we have multiple service instances, because the message is sent to all of them
        if (!message.body.code || !message.body.identifier || !message.body.passwordHash || message.body.identifierType !== BusCodeSignInIdentifierType.customerCard) {
            return;
        }
        const replyMsg = createBusCodeSignInWithCredentialsReplyMessage();
        replyMsg.header.correlationId = message.header.correlationId;
        const cacheItem = await this.cacheHelper.getCodeSignIn(message.body.code);
        if (!cacheItem) {
            replyMsg.body.success = false;
            replyMsg.body.errorMessage = 'Code not found';
            replyMsg.body.errorCode = BusCodeSignInErrorCode.codeNotFound;
            replyMsg.header.failure = true;
            this.publishToSharedChannel(replyMsg);
            return;
        }
        const now = this.getNowAsNumber();
        if ((now - cacheItem.createdAt) > this.state.codeSignInDurationSeconds * 1000) {
            replyMsg.body.success = false;
            replyMsg.body.errorMessage = 'Code has expired';
            replyMsg.body.errorCode = BusCodeSignInErrorCode.codeHasExpired;
            replyMsg.header.failure = true;
            this.publishToSharedChannel(replyMsg);
            return;
        }

        const connectedClientsWithConnectionInstanceId = this.getConnectedClientsDataBy(x => x.connectionInstanceId === cacheItem.connectionInstanceId);
        if (connectedClientsWithConnectionInstanceId.length === 0) {
            // TODO: This will not work if we have multiple instances of pc-connector
            //       It might be that another instance owns the connectionInstanceId
            replyMsg.body.success = false;
            replyMsg.body.errorMessage = 'Connection has expired';
            replyMsg.body.errorCode = BusCodeSignInErrorCode.connectionExpired;
            replyMsg.header.failure = true;
            this.publishToSharedChannel(replyMsg);
            return;
        }

        message.body.identifier = message.body.identifier.trim();
        // We expect only one item with specified connectionInstanceId
        const clientData = connectedClientsWithConnectionInstanceId[0];
        try {
            // Log in the customer card
            const logInBusReqMsg = createBusStartDeviceOnPrepaidTariffByCustomerRequestMessage();
            logInBusReqMsg.body.deviceId = clientData.deviceId!;
            logInBusReqMsg.body.passwordHash = message.body.passwordHash;
            logInBusReqMsg.body.tariffId = +message.body.identifier;
            const logInBusRes = await firstValueFrom(this.publishToDevicesChannelAndWaitForReply<BusStartDeviceOnPrepaidTariffByCustomerReplyMessageBody>(logInBusReqMsg, clientData));
            if (logInBusRes.header.failure || !logInBusRes.body.success) {
                replyMsg.body.success = false;
                replyMsg.body.errorMessage = `Can't sign in with code`;
                replyMsg.header.failure = true;
                replyMsg.header.errors = logInBusRes.header.errors;
                // Respond with the error
                const serverToDeviceReplyMsg = createServerToDeviceStartOnPrepaidTariffReplyMessage();
                serverToDeviceReplyMsg.body.alreadyInUse = logInBusRes.body.alreadyInUse;
                serverToDeviceReplyMsg.body.notAllowed = logInBusRes.body.notAllowed;
                serverToDeviceReplyMsg.body.passwordDoesNotMatch = logInBusRes.body.passwordDoesNotMatch;
                serverToDeviceReplyMsg.body.remainingSeconds = logInBusRes.body.remainingSeconds;
                serverToDeviceReplyMsg.body.noRemainingTime = logInBusRes.body.noRemainingTime;
                serverToDeviceReplyMsg.body.notAvailableForThisDeviceGroup = logInBusRes.body.notAvailableForThisDeviceGroup;
                serverToDeviceReplyMsg.body.success = logInBusRes.body.success;
                serverToDeviceReplyMsg.header.failure = logInBusRes.header.failure;
                const fakeDeviceToServerStartOnPrepaidTariffReqMsg: DeviceToServerStartOnPrepaidTariffRequestMessage = {
                    header: { type: DeviceToServerRequestMessageType.startOnPrepaidTariff } as DeviceToServerRequestMessageHeader,
                    body: {} as DeviceToServerStartOnPrepaidTariffRequestMessageBody,
                };
                this.sendReplyMessageToDevice(serverToDeviceReplyMsg, fakeDeviceToServerStartOnPrepaidTariffReqMsg, clientData);
            } else {
                // Customer card log in succeeded - create long lived token
                const createLongLivedTokenReqMsg = createBusCreateLongLivedAccessTokenForTariffRequestMessage();
                createLongLivedTokenReqMsg.body.passwordHash = message.body.passwordHash;
                createLongLivedTokenReqMsg.body.tariffId = +message.body.identifier;
                const createLongLivedAccessTokenRes = await firstValueFrom(this.publishToSharedChannelAndWaitForReply<BusCreateLongLivedAccessTokenForTariffReplyMessageBody>(createLongLivedTokenReqMsg, clientData));
                if (!createLongLivedAccessTokenRes.header.failure) {
                    const token: LongLivedAccessToken = createLongLivedAccessTokenRes.body.longLivedToken;
                    replyMsg.body.success = true;
                    replyMsg.body.token = token.token;
                    replyMsg.body.identifier = message.body.identifier;
                    replyMsg.body.identifierType = BusCodeSignInIdentifierType.customerCard;
                    await this.cacheHelper.deleteCodeSignIn(message.body.code);
                } else {
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.serverError,
                        description: 'Server error',
                    }] as MessageError[];
                    replyMsg.body.success = false;
                    replyMsg.body.errorMessage = `Can't create token`;
                }
            }
        } catch (err) {
            this.logger.error(`Error on code sign in with credentials`, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: DeviceMessageErrorCode.internalServerError,
                description: 'Internal server error',
            }];
        }
        this.publishToSharedChannel(replyMsg);
    }

    async processBusGetSignInCodeInfoRequestMessage(message: BusGetSignInCodeInfoRequestMessage): Promise<void> {
        // TODO: This function logic will not work if we have multiple service instances, because the message is sent to all of them
        if (!message.body.code || message.body.identifierType !== BusCodeSignInIdentifierType.customerCard) {
            return;
        }

        const replyMsg = createBusGetSignInCodeInfoReplyMessage();
        replyMsg.body.code = message.body.code;
        replyMsg.body.identifierType = BusCodeSignInIdentifierType.customerCard;
        replyMsg.body.codeDurationSeconds = this.state.codeSignInDurationSeconds;
        replyMsg.header.correlationId = message.header.correlationId;
        try {
            const cacheItem = await this.cacheHelper.getCodeSignIn(message.body.code);
            if (!cacheItem) {
                replyMsg.body.isValid = false;
                this.publishToSharedChannel(replyMsg);
                return;
            }
            // Find the connection data for this sign in code
            const clientData = this.getAllConnectedClientsData().find(x => x.connectionInstanceId === cacheItem.connectionInstanceId);
            if (!clientData) {
                replyMsg.body.isValid = false;
                this.publishToSharedChannel(replyMsg);
                return;
            }
            const now = this.getNowAsNumber();
            const diff = now - cacheItem.createdAt;
            if (diff > this.state.codeSignInDurationSeconds * 1000) {
                replyMsg.body.isValid = false;
                this.publishToSharedChannel(replyMsg);
                return;
            }
            const validTo = cacheItem.createdAt + this.state.codeSignInDurationSeconds * 1000;
            if (now > validTo) {
                replyMsg.body.isValid = false;
                this.publishToSharedChannel(replyMsg);
                return;
            }
            let remainingSeconds = Math.floor((validTo - now) / 1000);
            if (remainingSeconds <= 0) {
                remainingSeconds = 0;
            }
            replyMsg.body.remainingSeconds = remainingSeconds;
            replyMsg.body.isValid = remainingSeconds > 0;
            this.publishToSharedChannel(replyMsg);
            return;
        } catch (err) {
            this.logger.error(`Can't get sign in code`, err);
            replyMsg.body.isValid = false;
            replyMsg.header.failure = true;
            this.publishToSharedChannel(replyMsg);
            return;
        }
    }

    processBusFilterServerLogsNotificationMessage(message: BusFilterServerLogsNotificationMessage): void {
        const pcConnectorItem = message.body.filterServerLogsItems.find(x => x.serviceName === this.messageBusIdentifier);
        if (pcConnectorItem) {
            if (pcConnectorItem) {
                this.state.filterLogsItem = pcConnectorItem;
                this.state.filterLogsRequestedAt = this.getNowAsNumber();
                this.logger.setMessageFilter(pcConnectorItem.messageFilter);
            }
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
            case MessageType.busShutdownDevicesRequest:
                this.processBusShutdownDevicesRequestMessage(message as BusShutdownDevicesRequestMessage);
                break;
            case MessageType.busGetDeviceConnectivityDetailsRequest:
                this.processBusGetDeviceConnectivityDetailsRequestMessage(message as BusGetDeviceConnectivityDetailsRequestMessage);
                break;
            case MessageType.busRestartDevicesRequest:
                this.processBusRestartDevicesRequestMessage(message as BusRestartDevicesRequestMessage);
                break;
            case MessageType.busShutdownStoppedRequest:
                this.processBusShutdownStoppedRequestMessage(message as BusShutdownStoppedRequestMessage);
                break;
            case MessageType.busDeviceStatusesNotification:
                this.processDeviceStatusesMessage(message as BusDeviceStatusesNotificationMessage);
                break;
        }
    }

    processBusShutdownDevicesRequestMessage(message: BusShutdownDevicesRequestMessage): void {
        const replyMsg = createBusShutdownDevicesReplyMessage();
        if (!(message.body.deviceIds?.length > 0)) {
            replyMsg.body.targetsCount = 0;
            this.publishToDevicesChannel(replyMsg, message);
            return;
        }
        const deviceIdsSet = new Set<number>(Array.from(message.body.deviceIds));
        const clientsToSendTo: ConnectedClientData[] = [];
        for (const connectedClient of this.connectedClients.values()) {
            if (connectedClient.deviceId && deviceIdsSet.has(connectedClient.deviceId)) {
                clientsToSendTo.push(connectedClient);
            }
        }
        replyMsg.body.targetsCount = (new Set<number>(clientsToSendTo.map(x => x.deviceId!))).size;
        const shutdownNotificationMsg = createServerToDeviceShutdownNoitificationMessage();
        for (const clientData of clientsToSendTo) {
            try {
                this.sendNotificationMessageToDevice(shutdownNotificationMsg, clientData);
            } catch (err) {
                this.logger.warn(`Can't send to device connection id ${clientData.connectionId}`, shutdownNotificationMsg, err);
            }
        }
        this.publishToDevicesChannel(replyMsg, message);
    }

    processBusGetDeviceConnectivityDetailsRequestMessage(message: BusGetDeviceConnectivityDetailsRequestMessage): void {
        const replyMsg = createBusGetDeviceConnectivityDetailsReplyMessage();
        const connectivitySnapshot = this.connectivityHelper.getSnapshot();
        const deviceConnectivity = connectivitySnapshot.find(x => x.deviceId === message.body.deviceId);
        if (!deviceConnectivity) {
            replyMsg.body.connectionEventItems = [];
            replyMsg.body.connectionsCount = 0;
            replyMsg.body.deviceId = message.body.deviceId;
            replyMsg.body.isConnected = false;
            replyMsg.body.receivedMessagesCount = 0;
            replyMsg.body.sentMessagesCount = 0;
            replyMsg.body.secondsSinceLastReceivedMessage = 0;
            replyMsg.body.secondsSinceLastSentMessage = 0;
            replyMsg.body.secondsSinceLastConnection = 0;
            this.publishToDevicesChannel(replyMsg, message);
            return;
        }
        const clientData = this.getAllConnectedClientsData().find(x => x.certificateThumbprint === deviceConnectivity.certificateThumbprint);
        const now = this.getNowAsNumber();
        replyMsg.body.connectionsCount = deviceConnectivity.connectionsCount;
        replyMsg.body.deviceId = message.body.deviceId;
        replyMsg.body.isConnected = !!clientData;
        if (clientData) {
            replyMsg.body.sentMessagesCount = clientData.sentMessagesCount;
            replyMsg.body.receivedMessagesCount = clientData.receivedMessagesCount;
            replyMsg.body.secondsSinceLastSentMessage = clientData.lastMessageSentAt ? this.getDiffInSeconds(now, clientData.lastMessageSentAt) : undefined;
            replyMsg.body.secondsSinceLastReceivedMessage = clientData.lastMessageReceivedAt ? this.getDiffInSeconds(now, clientData.lastMessageReceivedAt) : undefined;
        }
        replyMsg.body.secondsSinceLastConnection = this.getDiffInSeconds(now, deviceConnectivity.lastConnectionSince);
        replyMsg.body.connectionEventItems = deviceConnectivity.connectionEventItems;

        this.publishToDevicesChannel(replyMsg, message);
    }

    processBusRestartDevicesRequestMessage(message: BusRestartDevicesRequestMessage): void {
        const replyMsg = createBusRestartDevicesReplyMessage();
        if (!(message.body.deviceIds?.length > 0)) {
            replyMsg.body.targetsCount = 0;
            this.publishToDevicesChannel(replyMsg, message);
            return;
        }
        const deviceIdsSet = new Set<number>(Array.from(message.body.deviceIds));
        const clientsToSendTo: ConnectedClientData[] = [];
        for (const connectedClient of this.connectedClients.values()) {
            if (connectedClient.deviceId && deviceIdsSet.has(connectedClient.deviceId)) {
                clientsToSendTo.push(connectedClient);
            }
        }
        replyMsg.body.targetsCount = (new Set<number>(clientsToSendTo.map(x => x.deviceId!))).size;
        const restartNotificationMsg = createServerToDeviceRestartNoitificationMessage();
        for (const clientData of clientsToSendTo) {
            try {
                this.sendNotificationMessageToDevice(restartNotificationMsg, clientData);
            } catch (err) {
                this.logger.warn(`Can't send to device connection id ${clientData.connectionId}`, restartNotificationMsg, err);
            }
        }
        this.publishToDevicesChannel(replyMsg, message);
    }

    processBusShutdownStoppedRequestMessage(message: BusShutdownStoppedRequestMessage): void {
        const busReqMsg = createBusGetDeviceStatusesRequestMessage();
        this.publishToDevicesChannelAndWaitForReply<BusGetDeviceStatusesReplyMessageBody>(busReqMsg, null)
            .subscribe(busReplyMsg => {
                const replyMsg = createBusShutdownStoppedReplyMessage();
                if (!busReplyMsg.header.failure) {
                    const stoppedDeviceIdsSet = new Set<number>(busReplyMsg.body.deviceStatuses.filter(x => !x.started).map(x => x.deviceId));
                    const clientsToSendTo: ConnectedClientData[] = [];
                    for (const connectedClient of this.connectedClients.values()) {
                        if (connectedClient.deviceId && stoppedDeviceIdsSet.has(connectedClient.deviceId)) {
                            clientsToSendTo.push(connectedClient);
                        }
                    }
                    replyMsg.body.targetsCount = (new Set<number>(clientsToSendTo.map(x => x.deviceId!))).size;
                    const shutdownNotificationMsg = createServerToDeviceShutdownNoitificationMessage();
                    for (const clientData of clientsToSendTo) {
                        try {
                            this.sendNotificationMessageToDevice(shutdownNotificationMsg, clientData);
                        } catch (err) {
                            this.logger.warn(`Can't send to device connection id ${clientData.connectionId}`, shutdownNotificationMsg, err);
                        }
                    }
                } else {
                    replyMsg.body.targetsCount = 0;
                    this.errorHelper.setBusMessageFailure(busReplyMsg, message, replyMsg);
                }
                this.publishToDevicesChannel(replyMsg, message);
            });
    }

    processDeviceStatusesMessage(message: BusDeviceStatusesNotificationMessage): void {
        this.sendStatusToDevices(message.body.deviceStatuses, message.body.continuationTariffShortInfos);
    }

    // sendMessageToConnectedDevice(connectedClientData: ConnectedClientData, message: any): void {

    // }

    sendStatusToDevices(deviceStatuses: DeviceStatus[], continuationTariffsShortInfo: TariffShortInfo[] | undefined): void {
        for (const status of deviceStatuses) {
            const connections = this.getConnectedClientsDataByDeviceId(status.deviceId);
            if (connections.length > 0) {
                for (const connection of connections) {
                    const connectionId = connection[0];
                    const clientData = connection[1];
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
                    if (this.state.isSecondPriceFeatureEnabled && msg.body.amounts.totalSum && this.state.secondPriceRate) {
                        const calculatedSecondPrice = msg.body.amounts.totalSum * this.state.secondPriceRate;
                        if (calculatedSecondPrice) {
                            // Currencies should have 100 "cents" in order to do this calculation
                            msg.body.amounts.totalSumSecondPrice = Math.ceil(calculatedSecondPrice * 100) / 100;
                        }
                    }
                    if (continuationTariffsShortInfo && status.continuationTariffId) {
                        const tariffShortInfo = continuationTariffsShortInfo.find(x => x.id === status.continuationTariffId);
                        if (tariffShortInfo) {
                            msg.body.continuationTariffShortInfo = tariffShortInfo;
                        }
                    }
                    try {
                        this.sendNotificationMessageToDevice(msg, clientData);
                    } catch (err) {
                        this.logger.warn(`Can't send to device connection id ${connectionId}`, msg, err);
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

        interface NoCertificateDataItem {
            ip: string;
            port: number;
            packet: string;
            httpToUdpProxyUrl?: string | null;
            customHttpToUdpProxyRequestHeaders?: string | null;
        }

        let delayMs: number | undefined | null;
        const noCertDataItems: NoCertificateDataItem[] = [];

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
                let httpToUdpProxyUrl: string | undefined | null;
                let customHttpToUdpProxyRequestHeaders: string | undefined | null;
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
                const httpToUdpProxyUrlLine = trimmedLines.find(x => x.startsWith('HttpToUdpProxyUrl='));
                if (httpToUdpProxyUrlLine) {
                    const httpToUdpProxyUrlParts = httpToUdpProxyUrlLine.split('=');
                    httpToUdpProxyUrl = httpToUdpProxyUrlParts[1]?.trim();
                }
                if (!delayMs) {
                    const delayBetweenPacketsMillisecondsLine = trimmedLines.find(x => x.startsWith('DelayBetweenPacketsMilliseconds='));
                    if (delayBetweenPacketsMillisecondsLine) {
                        const delayParts = delayBetweenPacketsMillisecondsLine.split('=');
                        delayMs = +delayParts[1];
                    }
                }
                if (!customHttpToUdpProxyRequestHeaders) {
                    const customHttpToUdpProxyRequestHeaderLine = trimmedLines.find(x => x.startsWith('CustomHttpToUdpProxyRequestHeaders='));
                    if (customHttpToUdpProxyRequestHeaderLine) {
                        const customHeaderParts = customHttpToUdpProxyRequestHeaderLine.split('=', 2);
                        customHttpToUdpProxyRequestHeaders = customHeaderParts[1];
                    }
                }
                if (packetToSend && (packetToSend.length % 2) === 0) {
                    noCertDataItems.push({
                        ip: noCertDevice.ipAddress,
                        port: port!,
                        packet: packetToSend,
                        httpToUdpProxyUrl: httpToUdpProxyUrl,
                        customHttpToUdpProxyRequestHeaders: customHttpToUdpProxyRequestHeaders,
                    });
                } else {
                    // Packet to send is not valid   
                    this.logger.warn(`processBusDeviceStatusesMessageForNoCertificateDevices: packet to send is not valid`);
                }
            }
        }

        const dataItemsToSendToProxy = noCertDataItems.filter(x => !!x.httpToUdpProxyUrl);
        if (dataItemsToSendToProxy.length > 0) {
            interface PacketData {
                destinationIpAddress: string;
                destinationPort: number;
                packetHexString: string;
            }
            interface SendPacketsRequest {
                packetsData: PacketData[];
                delayBetweenPacketsMilliseconds: number;
            }
            // TODO: Currently we require to use same Http-to-Udp proxy for all the items
            //       Later we could support different proxies
            const proxyUrl = dataItemsToSendToProxy[0].httpToUdpProxyUrl!;
            const req: SendPacketsRequest = {
                delayBetweenPacketsMilliseconds: delayMs || 0,
                packetsData: dataItemsToSendToProxy.map(x => ({
                    destinationIpAddress: x.ip,
                    destinationPort: x.port,
                    packetHexString: x.packet,
                })),
            };
            try {
                const url = new URL(proxyUrl);
                url.pathname = 'send-packets';
                this.logger.log(`processBusDeviceStatusesMessageForNoCertificateDevices: Sending ${dataItemsToSendToProxy.length} items to Http-to-Udp proxy url '${url.href}'`);
                // TODO: This will turn off certificate validation for the entire process
                //       We must use per-request certificate validation
                this.disableCertificateValidation();
                const headers: Record<string, string> = {
                    'Content-type': 'application/json; charset=UTF-8'
                };
                const customHeaders: { name: string, value: string }[] = [];
                const customHeadersText = dataItemsToSendToProxy[0].customHttpToUdpProxyRequestHeaders?.trim();
                if (customHeadersText) {
                    const headersItems = customHeadersText.split(';');
                    for (const headerItem of headersItems) {
                        const headerParts = headerItem.split(':');
                        customHeaders.push({ name: headerParts[0], value: headerParts[1] });
                    }
                }
                if (customHeaders.length > 0) {
                    for (const customHeader of customHeaders) {
                        headers[customHeader.name] = customHeader.value;
                    }
                }
                const res = await fetch(url.href, {
                    method: 'POST',
                    body: JSON.stringify(req),
                    headers: headers,
                });
                this.enableCertificateValidation();
                if (res.status != 200) {
                    this.logger.warn(`processBusDeviceStatusesMessageForNoCertificateDevices: Http-to-Udp proxy response status 200 expected but '${res.status}' received`);
                }
            } catch (err) {
                this.logger.warn(`processBusDeviceStatusesMessageForNoCertificateDevices: Can't send request to Http-To-Udp proxy 'proxyUrl'.  Error: ${err}, ${(err as Error).cause}`);
            }
        }

        const dataItemsToSendDirectly = noCertDataItems.filter(x => !x.httpToUdpProxyUrl);
        const lastDataItemToSendDirectly = dataItemsToSendDirectly[dataItemsToSendDirectly.length - 1];
        for (const dataItemToSendDirectly of dataItemsToSendDirectly) {
            try {
                this.logger.log(`processBusDeviceStatusesMessageForNoCertificateDevices: Sending to ${dataItemToSendDirectly.ip}:${dataItemToSendDirectly.port} packet ${dataItemToSendDirectly.packet} with delay between packets '${delayMs || 0}'`);
                const buffer = this.hexStringToBuffer(dataItemToSendDirectly.packet);
                this.udpHelper.send(buffer, dataItemToSendDirectly.port, dataItemToSendDirectly.ip);
                if (delayMs && dataItemToSendDirectly !== lastDataItemToSendDirectly) {
                    await this.delay(delayMs);
                }
            } catch (err) {
                this.logger.warn(`processBusDeviceStatusesMessageForNoCertificateDevices: Can't send UDP packet ${dataItemToSendDirectly.packet} to ${dataItemToSendDirectly.ip}:${dataItemToSendDirectly.port}. Error: ${err}`);
            }
        }
    }

    private disableCertificateValidation(): void {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    private enableCertificateValidation(): void {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    }

    async delay(ms: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => resolve(), ms);
        });
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
            this.logger.warn(`The device is not active. Closing connection. Device ${device?.id}`, clientData);
            this.removeClient(connectionId);
            this.wssServer.closeConnection(connectionId);
            return;
        }

        const note = `Connection ${clientData.connectionId}/${clientData.connectionInstanceId}`;
        this.publishDeviceConnectionEventMessage(device.id, clientData.ipAddress, DeviceConnectionEventType.connected, note);

        // Attach websocket server to connection so we receive events
        const connectionExist = this.wssServer.attachToConnection(connectionId);
        if (!connectionExist) {
            this.removeClient(connectionId);
            return;
        }
        clientData.deviceId = device.id;
        clientData.device = device;
        this.sendDeviceMessageDeviceConfiguration(clientData);
    }

    private publishDeviceConnectionEventMessage(deviceId: number, ipAddress: string, eventType: DeviceConnectionEventType, note?: string): void {
        const deviceConnectionEventMsg = createBusDeviceConnectionEventNotificationMessage();
        deviceConnectionEventMsg.body = {
            ...deviceConnectionEventMsg.body,
            deviceId: deviceId,
            ipAddress: ipAddress,
            note: note,
            type: eventType,
        };
        this.publishToDevicesChannel(deviceConnectionEventMsg);
    }

    private sendDeviceMessageDeviceConfiguration(clientData: ConnectedClientData): void {
        const msg = createServerToDeviceDeviceConfigurationNotificationMessage();
        // TODO: Get configuration from the database
        msg.body = this.createServerToDeviceDeviceConfigurationNotificationMessageBody(this.state.systemSettings);
        this.sendNotificationMessageToDevice(msg, clientData);
    }

    private createServerToDeviceDeviceConfigurationNotificationMessageBody(systemSettings: SystemSetting[]): ServerToDeviceDeviceConfigurationNotificationMessageBody {
        let result: ServerToDeviceDeviceConfigurationNotificationMessageBody = {} as ServerToDeviceDeviceConfigurationNotificationMessageBody;
        if (!(systemSettings?.length > 0)) {
            result = {
                pingInterval: this.state.defaultClientsToServerPingInterval,
                secondsAfterStoppedBeforeRestart: this.state.defaultSecondsAfterStoppedBeforeRestart,
                secondsBeforeNotifyingCustomerForSessionEnd: 0,
                sessionEndNotificationSoundFilePath: null,
                featureFlags: {
                    codeSignIn: false,
                    secondPrice: false,
                },
                secondPriceCurrency: null,
            };
            return result;
        }

        const secondsBeforeRestartingStoppedComputersValue = systemSettings.find(x => x.name === SystemSettingsName.seconds_before_restarting_stopped_computers)?.value;

        let secondsBeforeNotifyingCustomerForSessionEnd = 0;
        let sessionEndNotificationSoundFilePath: string | null = null;
        const secondsBeforeNotifyForSessionEndSetting = systemSettings.find(x => x.name === SystemSettingsName.seconds_before_notifying_customers_for_session_end);
        if (secondsBeforeNotifyForSessionEndSetting?.value) {
            const parts = secondsBeforeNotifyForSessionEndSetting.value.split(',').map(x => x.trim());
            secondsBeforeNotifyingCustomerForSessionEnd = +parts[0] || 0;
            sessionEndNotificationSoundFilePath = parts[1];
        }

        let secondPriceCurrency = '';
        let secondPriceRate = 0;
        const secondPriceSetting = systemSettings.find(x => x.name === SystemSettingsName.feature_second_price);
        if (secondPriceSetting?.value) {
            const parts = secondPriceSetting.value.split(',').map(x => x.trim());
            secondPriceCurrency = parts[0];
            secondPriceRate = +parts[1];
        }
        result = {
            secondsAfterStoppedBeforeRestart: secondsBeforeRestartingStoppedComputersValue ? +secondsBeforeRestartingStoppedComputersValue : this.state.defaultSecondsAfterStoppedBeforeRestart,
            // TODO: Define pingInterval system setting
            pingInterval: this.state.defaultClientsToServerPingInterval,
            secondsBeforeNotifyingCustomerForSessionEnd: secondsBeforeNotifyingCustomerForSessionEnd,
            sessionEndNotificationSoundFilePath: sessionEndNotificationSoundFilePath,
            featureFlags: {
                codeSignIn: this.state.systemSettings.find(x => x.name === SystemSettingsName.feature_qrcode_sign_in_enabled)?.value?.toLowerCase() == "yes",
                secondPrice: secondPriceRate > 0,
            },
            secondPriceCurrency: secondPriceCurrency,
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

    deserializeWebSocketBufferToMessage(buffer: Buffer): Message<unknown> | null {
        const text = buffer.toString();
        const json = JSON.parse(text);
        return json as Message<unknown>;
    }

    deserializeBusMessageToMessage(text: string): Message<unknown> | null {
        const json = JSON.parse(text);
        return json as Message<unknown>;
    }

    private sendToDevice<TBody>(message: ServerToDeviceReplyMessage<TBody> | ServerToDeviceNotificationMessage<TBody>, clientData: ConnectedClientData): void {
        clientData.sentMessagesCount++;
        clientData.lastMessageSentAt = this.getNowAsNumber();
        this.wssServer.sendJSON(message, clientData.connectionId);
    }

    private sendNotificationMessageToDevice<TBody>(message: ServerToDeviceNotificationMessage<TBody>, clientData: ConnectedClientData): void {
        this.logger.log(`Sending notification message ${message.header.type} to device connection ${clientData.connectionId}`, message);
        this.sendToDevice(message, clientData);
    }

    private sendReplyMessageToDevice<TBody>(message: ServerToDeviceReplyMessage<TBody>, requestMessage: DeviceToServerRequestMessage<unknown>, clientData: ConnectedClientData): void {
        this.logger.log(`Sending reply message ${message.header.type} to device connection ${clientData.connectionId}`, message);
        message.header.correlationId = requestMessage.header.correlationId;
        if (message.header.failure) {
            // Not sure what the requestType is
            // message.header.requestType = requestMessage?.header?.type;
        }
        message.header.correlationId = requestMessage.header.correlationId;
        this.sendToDevice(message, clientData);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishToDevicesChannelAndWaitForReply<TReplyBody>(busMessage: Message<any>, clientData: ConnectedClientData | null): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            channel: ChannelName.devices,
            completedAt: 0,
            deviceId: clientData?.deviceId,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private publishToDevicesChannel<TBody>(message: Message<TBody>, sourceMessage?: Message<any>): Observable<Message<any>> {
        if (sourceMessage) {
            // Transfer source message common data (like round trip data) to destination message
            transferSharedMessageData(message, sourceMessage);
        }
        this.publishToChannel(message, ChannelName.devices);
        return this.subjectsService.getDevicesChannelBusMessageReceived();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private publishToSharedChannel<TBody>(message: Message<TBody>, sourceMessage?: Message<any>): Observable<Message<any>> {
        if (sourceMessage) {
            // Transfer source message common data (like round trip data) to destination message
            transferSharedMessageData(message, sourceMessage);
        }
        this.publishToChannel(message, ChannelName.shared);
        return this.subjectsService.getSharedChannelBusMessageReceived();
    }

    private async publishToChannel<TBody>(message: Message<TBody>, channelName: ChannelName): Promise<void> {
        message.header.source = this.messageBusIdentifier;
        this.logger.log(`Publishing message ${message.header.type} to channel ${channelName}`, message);
        try {
            await this.pubClient.publish(channelName, JSON.stringify(message));
            this.state.pubClientPublishErrorsCount = 0;
        } catch (err) {
            this.state.pubClientPublishErrorsCount++;
            this.logger.warn(`Cannot publish message to channel ${channelName}`, message, err);
            this.logger.warn(`PubClient publish errors count ${this.state.pubClientPublishErrorsCount}. Maximum allowed ${this.state.maxAllowedPubClientPublishErrorsCount}`);
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
        const redisHost = this.envVars.CCS3_REDIS_HOST.value!;
        const redisPort = this.envVars.CCS3_REDIS_PORT.value!;
        this.logger.log(`Using redis host ${redisHost} and port ${redisPort}`);

        await this.connectCacheClient(redisHost, redisPort);
        await this.connectPubClient(redisHost, redisPort);
        await this.connectSubClient(redisHost, redisPort);
    }

    async connectPubClient(redisHost: string, redisPort: number): Promise<void> {
        const pubClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.logger.error('PubClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                this.logger.error(`PubClient reconnect strategy error. Retries ${retries}`, err);
                return 5000;
            },
        };
        this.logger.log('PubClient connecting to Redis');
        await this.pubClient.connect(pubClientOptions);
        this.logger.log('PubClient connected to Redis');
    }

    async connectCacheClient(redisHost: string, redisPort: number): Promise<void> {
        const redisCacheClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.logger.error('CacheClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                this.logger.error(`CacheClient reconnect strategy error ${retries}`, err);
                return 5000;
            },
        };
        this.logger.log('CacheClient connecting');
        await this.cacheClient.connect(redisCacheClientOptions);
        this.logger.log('CacheClient connected');
    }

    private async connectSubClient(redisHost: string, redisPort: number): Promise<void> {
        const subClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.processSubClientError(err),
            reconnectStrategyCallback: (retries: number, err: Error) => this.processSubClientReconnectStrategyError(retries, err),
        };
        const subClientMessageCallback: RedisClientMessageCallback = (channelName, message) => {
            try {
                const messageJson = this.deserializeBusMessageToMessage(message);
                if (messageJson) {
                    this.processBusMessageReceived(channelName, messageJson);
                } else {
                    this.logger.warn('The message deserialized to null', message);
                }
            } catch (err) {
                this.logger.warn(`Cannot deserialize channel ${channelName} message`, message, err);
            }
        };
        this.logger.log('SubClient connecting to Redis');
        await this.subClient.connect(subClientOptions, subClientMessageCallback);
        this.logger.log('SubClient connected to Redis');
        await this.subClient.subscribe(ChannelName.shared);
        await this.subClient.subscribe(ChannelName.devices);
        this.logger.log('SubClient subscribed to the channels');
    }

    private processSubClientError(error: unknown): void {
        this.logger.error('SubClient error', error);
        this.state.subClientErrorsCount++;
        this.logger.warn(`SubClient errors count: ${this.state.subClientErrorsCount}. Maximum allowed: ${this.state.maxAllowedSubClientErrorsCount}`);
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
        this.logger.error(`SubClient reconnect strategy error ${retries}`, err);
        this.state.subClientReconnectionErrorsCount++;
        this.logger.warn(`SubClient reconnection errors count: ${this.state.subClientReconnectionErrorsCount}. Maximum allowed: ${this.state.maxAllowedSubClientReconnectionErrorsCount}`);
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
        this.state.clientConnectionsMonitorTimerHandle = setInterval(() => this.cleanUpClientConnections(), this.state.defaultCleanUpConnectionsInterval);
    }

    private startMainTimer(): void {
        this.state.mainTimerHandle = setInterval(() => this.processMainTimerTick(), 1000);
    }

    processMainTimerTick(): void {
        this.processConnectivityData(false);
        this.manageLogFiltering();
        this.cleanUpCodeSignInCacheItems();
    }

    async cleanUpCodeSignInCacheItems(): Promise<void> {
        if (!this.state.isQrCodeSignInFeatureEnabled) {
            return;
        }
        const now = this.getNowAsNumber();
        const diff = now - (this.state.lastCodeSignInCleanUpAt || 0);
        if (diff > this.state.cleanUpCodeSignInInterval) {
            this.state.lastCodeSignInCleanUpAt = now;
            const codeSignInDurationMs = this.state.codeSignInDurationSeconds * 1000;
            const keys = await this.cacheHelper.getAllCodeSignInKeys();
            for (const key of keys) {
                const cacheItem: CodeSignIn | null = await this.cacheHelper.getValue(key);
                if (cacheItem && ((now - cacheItem.createdAt) > codeSignInDurationMs)) {
                    await this.cacheHelper.deleteKey(key);
                }
            }
        }
    }

    manageLogFiltering(): void {
        const now = this.getNowAsNumber();
        if (this.state.filterLogsItem) {
            const diff = now - this.state.filterLogsRequestedAt!;
            // 10 minutes
            const filterLogsDuration = 10 * 60 * 1000;
            if (diff > filterLogsDuration) {
                this.logger.setMessageFilter(null);
                this.state.filterLogsItem = null;
                this.state.filterLogsRequestedAt = null;
            }
        }
    }

    private processConnectivityData(force: boolean): void {
        const now = this.getNowAsNumber();
        const diff = now - this.state.lastConnectivitySnapshotTimestamp;
        if (force || diff > this.state.connectivitySnapshotInterval) {
            this.state.lastConnectivitySnapshotTimestamp = now;
            const snapshot = this.connectivityHelper.getSnapshot();
            const allConnectedClientsSet = new Set<string>(this.getAllConnectedClientsData().map(x => x.certificateThumbprint));
            if (snapshot.length > 0) {
                const busConnectivityItems: BusDeviceConnectivityItem[] = [];
                for (const snapshotItem of snapshot) {
                    const busItem: BusDeviceConnectivityItem = {
                        deviceId: snapshotItem.deviceId,
                        isConnected: allConnectedClientsSet.has(snapshotItem.certificateThumbprint),
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
        const seconds = Math.floor((now - otherValue) / 1000);
        return seconds;
    }

    private cleanUpClientConnections(): void {
        const connectionIdsWithCleanUpReason = new Map<number, ConnectionCleanUpReason>();
        const now = this.getNowAsNumber();
        // Max idle time is 2.5 times the client to server ping interval
        const maxIdleTimeoutDuration = this.state.defaultClientsToServerPingInterval * 2.5;
        for (const entry of this.connectedClients.entries()) {
            const connectionId = entry[0];
            const data = entry[1];
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
            this.logger.warn(`Disconnecting client ${connectionId}`, entry[1], data);
            if (data) {
                const connectedAt = new Date(data.connectedAt).toISOString();
                const lastMessageReceivedAt = new Date(data.lastMessageReceivedAt || 0).toISOString();
                const lastMessageSentAt = new Date(data.lastMessageSentAt || 0).toISOString();
                const reasonText = `${entry[1].toString()}, Connection ${data.connectionId}/${data.connectionInstanceId}, Connected at ${connectedAt}, Last message received at ${lastMessageReceivedAt}, Received messages count ${data.receivedMessagesCount}, Last message sent at ${lastMessageSentAt}, Sent messages count ${data.sentMessagesCount}`;
                this.connectivityHelper.setDeviceDisconnected(data.certificateThumbprint, data.connectionId, data.connectionInstanceId, DeviceConnectivityConnectionEventType.idleTimeout, reasonText);
                if (data.deviceId) {
                    this.publishDeviceConnectionEventMessage(data.deviceId, data.ipAddress, DeviceConnectionEventType.idleTimeout, reasonText);
                }
            }
            this.removeClient(connectionId);
            this.wssServer.closeConnection(connectionId);
        }

        if (connectionIdsWithCleanUpReason.size > 0) {
            this.processConnectivityData(true);
        }
    }

    getConnectedClientsDataBy(predicate: (clientData: ConnectedClientData) => boolean): ConnectedClientData[] {
        const result: ConnectedClientData[] = [];
        for (const item of this.getAllConnectedClientsData()) {
            if (predicate(item)) {
                result.push(item);
            }
        }
        return result;
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
            defaultClientsToServerPingInterval: 10000,
            defaultSecondsAfterStoppedBeforeRestart: 180,
            defaultCleanUpConnectionsInterval: 10000,
            messageBusReplyTimeout: 5000,
            systemSettings: [],
            isQrCodeSignInFeatureEnabled: false,
            codeSignInDurationSeconds: 3 * 60,
            // 1 minute
            cleanUpCodeSignInInterval: 1 * 60 * 1000,
            isSecondPriceFeatureEnabled: false,
            secondPriceCurrency: null,
            secondPriceRate: null,
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
    connectionInstanceId: string;
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
    lastMessageSentAt: number | null;
    sentMessagesCount: number;
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

    filterLogsItem?: FilterServerLogsItem | null;
    filterLogsRequestedAt?: number | null;

    defaultClientsToServerPingInterval: number;
    defaultSecondsAfterStoppedBeforeRestart: number;
    defaultCleanUpConnectionsInterval: number;

    isQrCodeSignInFeatureEnabled: boolean;
    codeSignInDurationSeconds: number;
    cleanUpCodeSignInInterval: number;
    lastCodeSignInCleanUpAt?: number | null;

    isSecondPriceFeatureEnabled: boolean;
    secondPriceCurrency?: string | null;
    secondPriceRate?: number | null;
}
