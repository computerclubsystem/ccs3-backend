import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { catchError, filter, finalize, first, firstValueFrom, Observable, of, timeout } from 'rxjs';

import {
    CreateConnectedRedisClientOptions, RedisCacheClient, RedisClientMessageCallback, RedisPubClient, RedisSubClient,
} from '@computerclubsystem/redis-client';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { MessageType } from '@computerclubsystem/types/messages/declarations/message-type.mjs';
import { BusDeviceStatusesNotificationMessage, DeviceStatus } from '@computerclubsystem/types/messages/bus/bus-device-statuses-notification.message.mjs';
import {
    ClientConnectedEventArgs, ConnectionClosedEventArgs, ConnectionErrorEventArgs,
    MessageReceivedEventArgs, WssServer, WssServerConfig, WssServerEventName, SendErrorEventArgs,
    ServerErrorEventArgs,
} from '@computerclubsystem/websocket-server';
import { OperatorAuthRequestMessage } from '@computerclubsystem/types/messages/operators/operator-auth.messages.mjs';
import { BusUserAuthReplyMessage, BusUserAuthReplyMessageBody, createBusUserAuthReplyMessage, createBusUserAuthRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-auth.messages.mjs';
import { createBusOperatorConnectionEventNotificatinMessage } from '@computerclubsystem/types/messages/bus/bus-operator-connection-event-notification.message.mjs';
import { createOperatorAuthReplyMessage } from '@computerclubsystem/types/messages/operators/operator-auth.messages.mjs';
import { Logger } from './logger.mjs';
import { IStaticFilesServerConfig, StaticFilesServer } from './static-files-server.mjs';
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { OperatorRequestMessage, OperatorNotificationMessage, OperatorReplyMessage } from '@computerclubsystem/types/messages/operators/declarations/operator.message.mjs';
import { OperatorRequestMessageType, OperatorNotificationMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { createOperatorConfigurationNotificationMessage, OperatorConfigurationNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-configuration-notification.message.mjs';
import { CacheHelper, UserAuthDataCacheValue } from './cache-helper.mjs';
import {
    CanProcessOperatorMessageResult, CanProcessOperatorMessageResultErrorReason, CodeSignIn, ConnectedClientData,
    ConnectionCleanUpReason, IsTokenActiveResult, MessageStatItem, OperatorConnectorState, OperatorConnectorValidators
} from './declarations.mjs';
import { createOperatorNotAuthenticatedReplyMessage } from '@computerclubsystem/types/messages/operators/operator-not-authenticated-reply.message.mjs';
import { AuthorizationHelper } from './authorization-helper.mjs';
import { SubjectsService } from './subjects.service.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { TariffValidator } from './tariff-validator.mjs';
import { createOperatorDeviceStatusesNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-device-statuses-notification.message.mjs';
import { OperatorDeviceStatus } from '@computerclubsystem/types/entities/operator-device-status.mjs';
import { OperatorGetDeviceStatusesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-statuses.messages.mjs';
import { createOperatorGetDeviceStatusesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-statuses.messages.mjs';
import { ErrorReplyHelper } from './error-reply-helper.mjs';
import { OperatorConnectionEventType } from '@computerclubsystem/types/entities/declarations/operator-connection-event-type.mjs';
import { createOperatorNotAuthorizedReplyMessage } from '@computerclubsystem/types/messages/operators/operator-not-authorized-reply.message.mjs';
import { BusDeviceConnectivitiesNotificationMessage, BusDeviceConnectivityItem } from '@computerclubsystem/types/messages/bus/bus-device-connectivities-notification.message.mjs';
import { createOperatorDeviceConnectivitiesNotificationMessage, OperatorDeviceConnectivityItem } from '@computerclubsystem/types/messages/operators/operator-device-connectivities-notification.message.mjs';
import { createOperatorForceSignOutAllUserSessionsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-force-sign-out-all-user-sessions.messages.mjs';
import { OperatorForceSignOutAllUserSessionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-force-sign-out-all-user-sessions.messages.mjs';
import { createOperatorSignedOutNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-signed-out-notification.message.mjs';
import { BusGetAllSystemSettingsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings.messages.mjs';
import { BusErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-error-code.mjs';
import { createBusGetAllSystemSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings.messages.mjs';
import { SystemSetting } from '@computerclubsystem/types/entities/system-setting.mjs';
import { BusAllSystemSettingsNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-all-system-settings-notification.message.mjs';
import { BusGetLastCompletedShiftReplyMessageBody, createBusGetLastCompletedShiftRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-last-completed-shift.messages.mjs';
import { createOperatorSignInInformationNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-sign-in-information-notification.message.mjs';
import { createOperatorPublicConfigurationNotificationMessage, OperatorPublicConfigurationNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-public-configuration-notification.message.mjs';
import { SystemSettingsName } from '@computerclubsystem/types/entities/system-setting-name.mjs';
import { BusCodeSignInWithCredentialsRequestMessage, createBusCodeSignInWithCredentialsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-code-sign-in-with-credentials.messages.mjs';
import { BusCreateLongLivedAccessTokenForUserReplyMessageBody, createBusCreateLongLivedAccessTokenForUserRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-long-lived-access-token-for-user.messages.mjs';
import { LongLivedAccessToken } from '@computerclubsystem/types/entities/long-lived-access-token.mjs';
import { BusCodeSignInWithLongLivedAccessTokenRequestMessage, createBusCodeSignInWithLongLivedAccessTokenReplyMessage } from '@computerclubsystem/types/messages/bus/bus-code-sign-in-with-long-lived-access-token.messages.mjs';
import { BusCodeSignInIdentifierType } from '@computerclubsystem/types/messages/bus/declarations/bus-code-sign-in-identifier-type.mjs';
import { BusCodeSignInErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-code-sign-in-error-code.mjs';
import { BusUserAuthWithLongLivedAccessTokenReplyMessageBody, createBusUserAuthWithLongLivedAccessTokenRequestMessage } from '@computerclubsystem/types/messages/bus/bus-user-auth-with-long-lived-access-token.messages.mjs';
import { BusGetSignInCodeInfoRequestMessage, createBusGetSignInCodeInfoReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-sign-in-code-info.messages.mjs';
import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';
import { OperatorRequestMessageHandler, ProcessOperatorRequestMessageContext } from './messaging/declarations.mjs';
import { RequestMessageHandlerHelper } from './messaging/request-message-handler-helper.mjs';

export class OperatorConnector {
    private readonly subClient = new RedisSubClient();
    private readonly pubClient = new RedisPubClient();
    private readonly messageBusIdentifier = 'ccs3/operator-connector';
    private logger = new Logger();
    private staticFilesServer?: StaticFilesServer;
    private readonly envVars = new EnvironmentVariablesHelper().createEnvironmentVars();
    private readonly state = this.createState();
    private readonly validators = this.createValidators();
    private readonly cacheClient = new RedisCacheClient();
    private readonly cacheHelper = new CacheHelper();
    private readonly authorizationHelper = new AuthorizationHelper();
    private readonly errorReplyHelper = new ErrorReplyHelper();
    private readonly subjectsService = new SubjectsService();
    private requestMessageHandlerMap!: Map<OperatorRequestMessageType, OperatorRequestMessageHandler>;

    private wssServer!: WssServer;
    private wssEmitter!: EventEmitter;
    private connectedClients = new Map<number, ConnectedClientData>();

    async processOperatorMessage(connectionId: number, message: OperatorRequestMessage<unknown>): Promise<void> {
        const clientData = this.getConnectedClientData(connectionId);
        if (!clientData) {
            return;
        }

        if (clientData.unauthorizedMessageRequestsCount > 100) {
            return;
        }

        const canProcessOperatorMessageResult = await this.canProcessOperatorMessage(clientData, message);
        if (!canProcessOperatorMessageResult.canProcess) {
            if (canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.notAuthorized) {
                clientData.unauthorizedMessageRequestsCount++;
            }
            this.logger.warn(`Can't process operator message`, canProcessOperatorMessageResult, message, clientData);
            if (canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenExpired
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenNotFound
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenNotProvided
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.messageRequiresAuthentication
            ) {
                // Send not authenticated
                const notAuthenticatedMsg = createOperatorNotAuthenticatedReplyMessage();
                notAuthenticatedMsg.header.correlationId = message.header?.correlationId;
                notAuthenticatedMsg.body.requestedMessageType = message.header?.type;
                notAuthenticatedMsg.header.failure = true;
                notAuthenticatedMsg.header.errors = [{
                    code: OperatorReplyMessageErrorCode.notAuthenticated,
                    description: 'Not authenticated. Sign in to authenticate.',
                }] as MessageError[];
                this.sendReplyMessageToOperator(notAuthenticatedMsg, clientData, message);
            }
            if (canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.notAuthorized) {
                // Send not authorized
                const notAuthorizedMsg = createOperatorNotAuthorizedReplyMessage();
                notAuthorizedMsg.header.correlationId = message.header?.correlationId;
                notAuthorizedMsg.body.requestedMessageType = message.header?.type;
                notAuthorizedMsg.header.failure = true;
                notAuthorizedMsg.header.errors = [{
                    code: OperatorReplyMessageErrorCode.notAuthorized,
                    description: `Not enough permissions to execute ${message.header?.type}.`,
                }] as MessageError[];
                this.sendReplyMessageToOperator(notAuthorizedMsg, clientData, message);
            }
            return;
        }

        clientData.lastMessageReceivedAt = this.getNowAsNumber();
        clientData.receivedMessagesCount++;
        const type = message.header.type;

        const handler = this.requestMessageHandlerMap.get(type);
        if (handler) {
            try {
                await handler.handle(this.createProcessOperatorRequestMessageContext(clientData, message));
            } catch (err) {
                this.logger.error(`Can't handle message ${type}`, message, err);
            }
            return;
        }

        switch (type) {
            case OperatorRequestMessageType.forceSignOutAllUserSessionsRequest:
                // This is related to connected clients logic and will be performed by the operator-connector itself
                this.processOperatorForceSignOutAllUserSessionsRequestMessage(clientData, message as OperatorForceSignOutAllUserSessionsRequestMessage);
                break;
            case OperatorRequestMessageType.getDeviceStatusesRequest:
                // This is related to connected clients logic and will be performed by the operator-connector itself
                this.processOperatorGetDeviceStatusesRequestMessage(clientData, message as OperatorGetDeviceStatusesRequestMessage);
                break;
            case OperatorRequestMessageType.pingRequest:
                clientData.receivedPingMessagesCount++;
                break;
        }
    }

    createProcessOperatorRequestMessageContext(
        clientData: ConnectedClientData,
        message: OperatorRequestMessage<unknown>,
    ): ProcessOperatorRequestMessageContext {
        const context: ProcessOperatorRequestMessageContext = {
            clientData: clientData,
            cacheHelper: this.cacheHelper,
            logger: this.logger,
            message: message,
            messageBusIdentifier: this.messageBusIdentifier,
            messageBusReplyTimeout: this.state.messageBusReplyTimeout,
            pingInterval: this.state.pingInterval,
            publishClient: this.pubClient,
            subjectsService: this.subjectsService,
            tokenExpirationMilliseconds: this.state.tokenExpirationMilliseconds,
            wssServer: this.wssServer,
            errorReplyHelper: this.errorReplyHelper,
            operatorConnectorState: this.state,
            operatorConnectorValidators: this.validators,
        };
        return context;
    }

    async processOperatorForceSignOutAllUserSessionsRequestMessage(clientData: ConnectedClientData, message: OperatorForceSignOutAllUserSessionsRequestMessage): Promise<void> {
        const replyMsg = createOperatorForceSignOutAllUserSessionsReplyMessage();
        const allUserAuthData = await this.cacheHelper.getUserAllAuthData(message.body.userId);
        for (const authData of allUserAuthData) {
            await this.cacheHelper.deleteUserAuthDataKey(authData.userId, authData.roundtripData.connectionInstanceId);
            await this.cacheHelper.deleteAuthTokenKey(authData.token);
        }

        // Also disconnect all sockets for the specified user
        const allUserConnectionData = this.getConnectedClientsDataByOperatorId(message.body.userId).map(x => x[1]);
        replyMsg.body.connectionsCount = allUserConnectionData.length;
        for (const userConnectionData of allUserConnectionData) {
            const signedOutNotificationMsg = createOperatorSignedOutNotificationMessage();
            this.sendNotificationMessageToOperator(signedOutNotificationMsg, userConnectionData);
            this.removeClient(userConnectionData.connectionId);
            this.wssServer.closeConnection(userConnectionData.connectionId);
            if (this.state.isQrCodeSignInFeatureEnabled) {
                this.removeCodeSignInForConnectionInstanceId(userConnectionData.connectionInstanceId);
            }
        }
        replyMsg.body.sessionsCount = allUserAuthData.length;
        this.sendReplyMessageToOperator(replyMsg, clientData, message);
    }

    processOperatorGetDeviceStatusesRequestMessage(clientData: ConnectedClientData, message: OperatorGetDeviceStatusesRequestMessage): void {
        // Simply simulate processing of the last bus notification message about device statuses
        // TODO: This will return old data - for example if it is requested immediatelly after a device was started, it will still return that the device is not started
        if (this.state.lastBusDeviceStatusesNotificationMessage) {
            // this.processBusDeviceStatusesMessage(this.state.lastBusDeviceStatusesMessage);
            const clientDataToSendTo = this.getConnectedClientsDataToSendDeviceStatusesMessageTo();
            const currentClientData = clientDataToSendTo.find(x => x.connectionInstanceId === clientData.connectionInstanceId);
            if (currentClientData) {
                // This client is authorized to receive device statuses
                const replyMsg = createOperatorGetDeviceStatusesReplyMessage();
                replyMsg.body.deviceStatuses = this.state.lastBusDeviceStatusesNotificationMessage.body.deviceStatuses;
                this.sendReplyMessageToOperator(replyMsg, clientData, message);
            } else {
                // The client is not authorized to receive device statuses
                const replyMsg = createOperatorGetDeviceStatusesReplyMessage();
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: 'not-authorized',
                    description: 'A permission required to execute the operation is not found',
                }] as MessageError[];
            }
        } else {
            // This will barely happen - only if the operator request comes before the state-manager to had a chance to calculate device statuses
            // Usually only on services start and can happen only in very short amount of time (like less than the time to refresh teh device statuses which is 5 seconds by default)
            // If this happens simply do not respond to the operator - it will timeout and will get the next device statuses notification message
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishToSharedChannelAndWaitForReply<TReplyBody>(busMessage: Message<any>, clientData: ConnectedClientData | null): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            channel: ChannelName.shared,
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            completedAt: 0,
            operatorId: clientData?.userId,
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
                this.subjectsService.setMessageStat(messageStatItem);
            }),
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private publishToDevicesChannelAndWaitForReply<TReplyBody>(busMessage: Message<any>, clientData: ConnectedClientData): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            channel: ChannelName.devices,
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            completedAt: 0,
            operatorId: clientData.userId,
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
                this.subjectsService.setMessageStat(messageStatItem);
            }),
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishToOperatorsChannelAndWaitForReply<TReplyBody>(busMessage: Message<any>, clientData: ConnectedClientData): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            channel: ChannelName.operators,
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            completedAt: 0,
            operatorId: clientData.userId,
        };
        if (!busMessage.header.correlationId) {
            busMessage.header.correlationId = this.createUUIDString();
        }
        messageStatItem.correlationId = busMessage.header.correlationId;
        return this.publishToOperatorsChannel(busMessage).pipe(
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
                this.subjectsService.setMessageStat(messageStatItem);
            }),
        );
    }

    createRoundTripDataFromConnectedClientData(clientData: ConnectedClientData): OperatorConnectionRoundTripData {
        const roundTripData: OperatorConnectionRoundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId
        };
        return roundTripData;
    }

    // processOperatorPingRequestMessage(clientData: ConnectedClientData, message: OperatorPingRequestMessage): void {
    //     // TODO: Do we need to do something on ping ? The lastMessageReceivedAt is already set
    // }

    processBusMessageReceived(channelName: string, message: Message<unknown>): void {
        if (this.isOwnMessage(message)) {
            return;
        }
        this.logger.log('Received channel', channelName, 'message', message.header.type, message);
        switch (channelName) {
            case ChannelName.operators:
                this.processOperatorsBusMessage(message);
                break;
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
        // Process shared channel notifications messages - all reply messages should be processed by the requester
        const type = message.header.type;
        switch (type) {
            case MessageType.busGetSignInCodeInfoRequest:
                this.processBusGetSignInCodeInfoRequestMessage(message as BusGetSignInCodeInfoRequestMessage);
                break;
            case MessageType.busCodeSignInWithLongLivedAccessTokenRequest:
                this.processBusCodeSignInWithLongLivedAccessTokenRequestMessage(message as BusCodeSignInWithLongLivedAccessTokenRequestMessage);
                break;
            case MessageType.busCodeSignInWithCredentialsRequest:
                this.processBusCodeSignInWithCredentialsRequestMessage(message as BusCodeSignInWithCredentialsRequestMessage);
                break;
            case MessageType.busAllSystemSettingsNotification:
                this.processBusAllSystemSettingsNotificationMessage(message as BusAllSystemSettingsNotificationMessage);
                break;
        }
    }

    async processBusGetSignInCodeInfoRequestMessage(message: BusGetSignInCodeInfoRequestMessage): Promise<void> {
        // TODO: This function logic will not work if we have multiple service instances, because the message is sent to all of them
        if (!message.body.code || message.body.identifierType !== BusCodeSignInIdentifierType.user) {
            return;
        }

        const replyMsg = createBusGetSignInCodeInfoReplyMessage();
        replyMsg.body.code = message.body.code;
        replyMsg.body.identifierType = BusCodeSignInIdentifierType.user;
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
            const clientData = this.getAllConnectedClientsData().find(x => x[1].connectionInstanceId === cacheItem.connectionInstanceId)?.[1];
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
            // Get how many seconds are remaining for the sign in code and how much time is left for the connection
            // before it is disconnected (because of authentication timeout) and use the smaller value of the two
            const signInCodeRemainingSeconds = Math.floor((validTo - now) / 1000);
            const connectionConnectedAtDiff = now - clientData.connectedAt;
            const connectionRemainingSeconds = Math.floor((this.state.authenticationTimeout - connectionConnectedAtDiff) / 1000);
            let remainingSeconds = Math.min(signInCodeRemainingSeconds, connectionRemainingSeconds);
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

    async processBusCodeSignInWithLongLivedAccessTokenRequestMessage(message: BusCodeSignInWithLongLivedAccessTokenRequestMessage): Promise<void> {
        // TODO: This function logic will not work if we have multiple service instances, because the message is sent to all of them
        if (!message.body.code || !message.body.token || message.body.identifierType !== BusCodeSignInIdentifierType.user) {
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
            // TODO: This will not work if we have multiple instances of operator-connector
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
            const busUserAuthWithLongLivedAccessTokenReq = createBusUserAuthWithLongLivedAccessTokenRequestMessage();
            busUserAuthWithLongLivedAccessTokenReq.body.token = message.body.token;
            busUserAuthWithLongLivedAccessTokenReq.body.ipAddress = message.body.ipAddress;
            // Operator authentications are not from devices defined in the system
            busUserAuthWithLongLivedAccessTokenReq.body.deviceId = null;
            const busRes = await firstValueFrom(this.publishToOperatorsChannelAndWaitForReply<BusUserAuthWithLongLivedAccessTokenReplyMessageBody>(busUserAuthWithLongLivedAccessTokenReq, clientData));
            if (busRes.header.failure || !busRes.body.success) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = busRes.header.errors;
                replyMsg.body.success = false;
                this.publishToSharedChannel(replyMsg);
                return;
            }
            const operatorMessage: OperatorAuthRequestMessage = {
                body: {},
                header: { type: OperatorRequestMessageType.authRequest },
            };
            const authReplyMsg = createBusUserAuthReplyMessage();
            authReplyMsg.header.roundTripData = this.createRoundTripDataFromConnectedClientData(clientData);
            authReplyMsg.body.permissions = busRes.body.permissions;
            authReplyMsg.body.success = busRes.body.success;
            authReplyMsg.body.userId = busRes.body.userId;
            authReplyMsg.body.username = busRes.body.username;
            await this.processBusOperatorAuthReplyMessage(clientData, authReplyMsg, operatorMessage, busRes.body.username!);
            replyMsg.body.success = true;
            replyMsg.body.identifier = busRes.body.username;
            replyMsg.body.identifierType = BusCodeSignInIdentifierType.user;
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
        if (!message.body.code || !message.body.identifier || !message.body.passwordHash || message.body.identifierType !== BusCodeSignInIdentifierType.user) {
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
            // TODO: This will not work if we have multiple instances of operator-connector
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
            // Log in the user
            const requestMsg = createBusUserAuthRequestMessage();
            requestMsg.body.passwordHash = message.body.passwordHash;
            requestMsg.body.username = message.body.identifier;
            requestMsg.header.roundTripData = this.createRoundTripDataFromConnectedClientData(clientData);
            const authReplyMsg = await firstValueFrom(this.publishToOperatorsChannelAndWaitForReply<BusUserAuthReplyMessageBody>(requestMsg, clientData));
            if (authReplyMsg.header.failure || !authReplyMsg.body.success) {
                replyMsg.body.success = false;
                replyMsg.body.errorMessage = `Can't sign in with code`;
                replyMsg.header.failure = true;
                replyMsg.header.errors = authReplyMsg.header.errors;
            } else {
                // Craft operatorMessage like the operator manually tried to authenticate but do not set credentials
                const operatorMessage: OperatorAuthRequestMessage = {
                    body: {},
                    header: { type: OperatorRequestMessageType.authRequest },
                };
                await this.processBusOperatorAuthReplyMessage(clientData, authReplyMsg, operatorMessage, message.body.identifier);
                const createLongLivedTokenReqMsg = createBusCreateLongLivedAccessTokenForUserRequestMessage();
                createLongLivedTokenReqMsg.body.passwordHash = message.body.passwordHash;
                createLongLivedTokenReqMsg.body.username = message.body.identifier;
                const createLongLivedAccessTokenRes = await firstValueFrom(this.publishToSharedChannelAndWaitForReply<BusCreateLongLivedAccessTokenForUserReplyMessageBody>(createLongLivedTokenReqMsg, clientData));
                if (!createLongLivedAccessTokenRes.header.failure) {
                    const token: LongLivedAccessToken = createLongLivedAccessTokenRes.body.longLivedToken;
                    replyMsg.body.success = true;
                    replyMsg.body.token = token.token;
                    replyMsg.body.identifier = message.body.identifier;
                    replyMsg.body.identifierType = BusCodeSignInIdentifierType.user;
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
                code: OperatorReplyMessageErrorCode.internalServerError,
                description: 'Internal server error',
            }] as MessageError[];
        }
        this.publishToSharedChannel(replyMsg);
    }

    processBusAllSystemSettingsNotificationMessage(message: BusAllSystemSettingsNotificationMessage): void {
        this.state.systemSettings = message.body.systemSettings;
        this.applySystemSettings(this.state.systemSettings);
        // TODO: Send appropriate settings to all connected clients
    }

    processOperatorsBusMessage<TBody>(message: Message<TBody>): void {
        this.subjectsService.setOperatorsChannelBusMessageReceived(message);
        // TODO: Process operators channel notifications messages - all reply messages should be processed by the requester
        // const type = message.header.type;
        // switch (type) {
        // }
    }

    async processBusOperatorAuthReplyMessage(
        clientData: ConnectedClientData,
        busUserAuthReplyMsg: BusUserAuthReplyMessage,
        operatorMessage: OperatorRequestMessage<unknown>,
        username: string,
    ): Promise<void> {
        const replyMsg = createOperatorAuthReplyMessage();
        if (!clientData) {
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.cantAuthenticate
            }] as MessageError[];
            this.sendReplyMessageToOperator(replyMsg, clientData, operatorMessage);
            return;
        }
        const rtData = busUserAuthReplyMsg.header.roundTripData! as OperatorConnectionRoundTripData;
        clientData.isAuthenticated = busUserAuthReplyMsg.body.success;
        clientData.permissions = new Set<PermissionName>(busUserAuthReplyMsg.body.permissions);
        clientData.userId = busUserAuthReplyMsg.body.userId;
        replyMsg.body.permissions = busUserAuthReplyMsg.body.permissions;
        replyMsg.body.success = busUserAuthReplyMsg.body.success;
        if (replyMsg.body.success) {
            replyMsg.body.token = this.createUUIDString();
            replyMsg.body.tokenExpiresAt = this.getNowAsNumber() + this.state.tokenExpirationMilliseconds;
            await this.maintainUserAuthDataTokenCacheItem(clientData.userId!, clientData.connectedAt, replyMsg.body.permissions!, replyMsg.body.token, rtData, username);
        }
        if (!busUserAuthReplyMsg.body.success) {
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.cantAuthenticate,
            }] as MessageError[];
        }
        this.sendReplyMessageToOperator(replyMsg, clientData, operatorMessage);
        if (busUserAuthReplyMsg.body.success) {
            // Send configuration message
            // TODO: Get configuration from the database
            const configurationMsg = this.createOperatorConfigurationMessage();
            this.sendNotificationMessageToOperator(configurationMsg, clientData);

            const note = JSON.stringify({
                messageBody: busUserAuthReplyMsg.body,
                clientData: clientData,
            });
            this.publishOperatorConnectionEventMessage(clientData.userId!, clientData.ipAddress, OperatorConnectionEventType.passwordAuthSuccess, note);
            this.sendSignInInformationNotificationMessage(clientData);
        }
    }

    private sendSignInInformationNotificationMessage(clientData: ConnectedClientData): void {
        const busGetLastShiftReqMsg = createBusGetLastCompletedShiftRequestMessage();
        this.publishToSharedChannelAndWaitForReply<BusGetLastCompletedShiftReplyMessageBody>(busGetLastShiftReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const signInInformationNotificationMsg = createOperatorSignInInformationNotificationMessage();
                signInInformationNotificationMsg.body.lastShiftCompletedAt = busReplyMsg.body.shift?.completedAt;
                signInInformationNotificationMsg.body.lastShiftCompletedByUsername = busReplyMsg.body.completedByUsername;
                this.sendNotificationMessageToOperator(signInInformationNotificationMsg, clientData);
            });
    }

    async canProcessOperatorMessage<TBody>(clientData: ConnectedClientData, message: OperatorRequestMessage<TBody>): Promise<CanProcessOperatorMessageResult> {
        const result: CanProcessOperatorMessageResult = {
            canProcess: false,
        } as CanProcessOperatorMessageResult;
        const msgType = message.header?.type;
        if (this.isWhiteSpace(msgType)) {
            result.canProcess = false;
            result.errorReason = CanProcessOperatorMessageResultErrorReason.messageTypeIsMissing;
            return result;
        }

        // Check if the message can be send anonymously
        const isAnonymousMessage = this.state.anonymousMessageTypesSet.has(msgType);
        if (!isAnonymousMessage && !clientData.isAuthenticated) {
            // The message can't be processed anonymously and the client is not authenticated
            result.canProcess = false;
            result.errorReason = CanProcessOperatorMessageResultErrorReason.messageRequiresAuthentication;
            return result;
        }

        // Non-anonymous messages must have token - check if it is still valid
        if (!isAnonymousMessage) {
            const token = message.header?.token;
            if (this.isWhiteSpace(token)) {
                // Token is not provided
                result.canProcess = false;
                result.errorReason = CanProcessOperatorMessageResultErrorReason.tokenNotProvided;
                return result;
            }
            const authTokenCacheValue = await this.cacheHelper.getAuthTokenValue(token!);
            if (!authTokenCacheValue) {
                // There is no such token in the cache
                result.canProcess = false;
                result.errorReason = CanProcessOperatorMessageResultErrorReason.tokenNotFound;
                return result;
            }
            if (this.getNowAsNumber() > authTokenCacheValue.tokenExpiresAt) {
                // The token expired
                await this.cacheHelper.deleteAuthTokenKey(token!);
                result.canProcess = false;
                result.errorReason = CanProcessOperatorMessageResultErrorReason.tokenExpired;
                return result;
            }
            // Check permissions
            const isAuthorizedResult = this.authorizationHelper.isAuthorized(clientData.permissions, msgType, clientData.isAuthenticated);
            if (!isAuthorizedResult.authorized) {
                result.canProcess = false;
                result.errorReason = CanProcessOperatorMessageResultErrorReason.notAuthorized;
                return result;
            }
        }
        result.canProcess = true;
        return result;
    }

    processDevicesBusMessage<TBody>(message: Message<TBody>): void {
        this.subjectsService.setDevicesChannelBusMessageReceived(message);
        const type = message.header.type;
        switch (type) {
            case MessageType.busDeviceConnectivitiesNotification:
                this.processBusDeviceConnectivitiesNotificationMessage(message as BusDeviceConnectivitiesNotificationMessage);
                break;
            case MessageType.busDeviceStatusesNotification:
                this.processBusDeviceStatusesNotificationMessage(message as BusDeviceStatusesNotificationMessage);
                break;
        }
    }

    processBusDeviceConnectivitiesNotificationMessage(message: BusDeviceConnectivitiesNotificationMessage): void {
        const clientDataToSendTo = this.getConnectedClientsDataToSendDeviceConnectivitiesNotificationMessageTo();
        if (clientDataToSendTo.length > 0) {
            const operatorNotificationMsg = createOperatorDeviceConnectivitiesNotificationMessage();
            const operatorDeviceConnectivityItems = message.body.connectivityItems.map(x => this.convertBusDeviceConnectivityItemtoOperatorDeviceConnectivityItem(x));
            operatorNotificationMsg.body.connectivityItems = operatorDeviceConnectivityItems;
            for (const clientData of clientDataToSendTo) {
                try {
                    this.sendNotificationMessageToOperator(operatorNotificationMsg, clientData);
                } catch (err) {
                    this.logger.warn(`Can't send to operator`, clientData, operatorNotificationMsg, err);
                }
            }
        }
    }

    convertBusDeviceConnectivityItemtoOperatorDeviceConnectivityItem(busItem: BusDeviceConnectivityItem): OperatorDeviceConnectivityItem {
        const result: OperatorDeviceConnectivityItem = {
            deviceId: busItem.deviceId,
            isConnected: busItem.isConnected,
        };
        return result;
    }

    async processBusDeviceStatusesNotificationMessage(message: BusDeviceStatusesNotificationMessage): Promise<void> {
        // Store the last device statuses bus message so we can send it back to operators on request
        this.state.lastBusDeviceStatusesNotificationMessage = message;
        // Send device statuses message to all connected operators that can read this information
        const clientDataToSendTo = this.getConnectedClientsDataToSendDeviceStatusesMessageTo();
        if (clientDataToSendTo.length > 0) {
            const deviceStatuses = message.body.deviceStatuses;
            const deviceStatusesNotificationMsg = createOperatorDeviceStatusesNotificationMessage();
            for (const clientData of clientDataToSendTo) {
                deviceStatusesNotificationMsg.body.deviceStatuses = deviceStatuses.map(x => this.convertDeviceStatusToOperatorDeviceStatus(x));
                try {
                    this.sendNotificationMessageToOperator(deviceStatusesNotificationMsg, clientData);
                } catch (err) {
                    this.logger.warn(`Can't send to operator`, clientData, deviceStatusesNotificationMsg, err);
                }
            }
        }
    }

    getConnectedClientsDataToSendDeviceStatusesMessageTo(): ConnectedClientData[] {
        const clientDataToSendTo: ConnectedClientData[] = [];
        const connections = this.getAllConnectedClientsData();
        for (const connection of connections) {
            const clientData = connection[1];
            if (clientData.isAuthenticated) {
                const isAuthorizedResult = this.authorizationHelper.isAuthorized(clientData.permissions, OperatorNotificationMessageType.deviceStatusesNotification, clientData.isAuthenticated);
                if (isAuthorizedResult.authorized) {
                    clientDataToSendTo.push(clientData);
                }
            }
        }
        return clientDataToSendTo;
    }

    getConnectedClientsDataToSendDeviceConnectivitiesNotificationMessageTo(): ConnectedClientData[] {
        const clientDataToSendTo: ConnectedClientData[] = [];
        const connections = this.getAllConnectedClientsData();
        for (const connection of connections) {
            const clientData = connection[1];
            if (clientData.isAuthenticated) {
                const isAuthorizedResult = this.authorizationHelper.isAuthorized(clientData.permissions, OperatorNotificationMessageType.deviceConnectivitiesNotification, clientData.isAuthenticated);
                if (isAuthorizedResult.authorized) {
                    clientDataToSendTo.push(clientData);
                }
            }
        }
        return clientDataToSendTo;
    }

    convertDeviceStatusToOperatorDeviceStatus(deviceStatus: DeviceStatus): OperatorDeviceStatus {
        const opDeviceStatus: OperatorDeviceStatus = {
            deviceId: deviceStatus.deviceId,
            enabled: deviceStatus.enabled,
            expectedEndAt: deviceStatus.expectedEndAt,
            remainingSeconds: deviceStatus.remainingSeconds,
            started: deviceStatus.started,
            startedAt: deviceStatus.startedAt,
            stoppedAt: deviceStatus.stoppedAt,
            tariff: deviceStatus.tariff,
            totalSum: deviceStatus.totalSum,
            totalTime: deviceStatus.totalTime,
            continuationTariffId: deviceStatus.continuationTariffId,
            note: deviceStatus.note,
        };
        this.removeNullAndUndefinedKeys(opDeviceStatus);
        return opDeviceStatus;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeNullAndUndefinedKeys(obj: Record<string, any>): void {
        const keys = Object.keys(obj);
        keys.forEach(key => {
            const value = obj[key];
            if (value === null || value === undefined) {
                // @typescript-eslint/no-dynamic-delete
                delete obj[key];
            }
        });
    }

    processOperatorConnectionClosed(args: ConnectionClosedEventArgs): void {
        this.logger.log('Operator connection closed', args);
        // Check if we still have this connection before saving connection event - it might be already removed because of timeout
        const clientData = this.getConnectedClientData(args.connectionId);
        if (clientData?.userId) {
            const note = JSON.stringify({
                args: args,
                clientData: clientData,
            });
            this.publishOperatorConnectionEventMessage(clientData.userId!, clientData.ipAddress!, OperatorConnectionEventType.disconnected, note);
        }
        this.removeClient(args.connectionId);
        if (this.state.isQrCodeSignInFeatureEnabled && clientData) {
            this.removeCodeSignInForConnectionInstanceId(clientData.connectionInstanceId);
        }
    }

    processOperatorConnectionError(args: ConnectionErrorEventArgs): void {
        this.logger.log('Operator connection error', args);
        // TODO: Should we close the connection ?
    }

    removeClient(connectionId: number): void {
        this.connectedClients.delete(connectionId);
    }

    publishOperatorConnectionEventMessage(operatorId: number, ipAddress: string | null, eventType: OperatorConnectionEventType, note?: string): void {
        if (!operatorId) {
            this.logger.warn(`Can't publish operator connection event message '${eventType}'. Specified operatorId is null`, ipAddress, note);
            return;
        }
        const deviceConnectionEventMsg = createBusOperatorConnectionEventNotificatinMessage();
        deviceConnectionEventMsg.body.operatorId = operatorId;
        deviceConnectionEventMsg.body.ipAddress = ipAddress;
        deviceConnectionEventMsg.body.type = eventType;
        deviceConnectionEventMsg.body.note = note;
        this.publishToOperatorsChannel(deviceConnectionEventMsg);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishToSharedChannel<TBody>(message: Message<TBody>): Observable<Message<any>> {
        message.header.source = this.messageBusIdentifier;
        this.logger.log(`Publishing message '${message.header.type}' to channel ${ChannelName.shared}`, message);
        this.pubClient.publish(ChannelName.shared, JSON.stringify(message));
        return this.subjectsService.getSharedChannelBusMessageReceived();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishToDevicesChannel<TBody>(message: Message<TBody>): Observable<Message<any>> {
        message.header.source = this.messageBusIdentifier;
        this.logger.log(`Publishing message '${message.header.type}' to channel ${ChannelName.devices}`, message);
        this.pubClient.publish(ChannelName.devices, JSON.stringify(message));
        return this.subjectsService.getDevicesChannelBusMessageReceived();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishToOperatorsChannel<TBody>(message: Message<TBody>): Observable<Message<any>> {
        message.header.source = this.messageBusIdentifier;
        this.logger.log(`Publishing message '${message.header.type}' to channel ${ChannelName.operators}`, message);
        this.pubClient.publish(ChannelName.operators, JSON.stringify(message));
        return this.subjectsService.getOperatorsChannelBusMessageReceived();
    }

    getConnectedClientsDataBy(predicate: (clientData: ConnectedClientData) => boolean): ConnectedClientData[] {
        const result: ConnectedClientData[] = [];
        for (const item of this.getAllConnectedClientsData()) {
            const data = item[1];
            if (predicate(data)) {
                result.push(data);
            }
        }
        return result;
    }

    getConnectedClientsDataByOperatorId(operatorId: number): [number, ConnectedClientData][] {
        const result: [number, ConnectedClientData][] = [];
        for (const item of this.getAllConnectedClientsData()) {
            const data = item[1];
            if (data.userId === operatorId) {
                result.push(item);
            }
        }
        return result;
    }

    deserializeWebSocketBufferToMessage<TMessage>(buffer: Buffer): TMessage | null {
        const text = buffer.toString();
        const json = JSON.parse(text);
        return json as TMessage;
    }

    deserializeBusMessageToMessage(text: string): Message<unknown> | null {
        const json = JSON.parse(text);
        return json as Message<unknown>;
    }

    isOwnMessage<TBody>(message: Message<TBody>): boolean {
        return (message.header.source === this.messageBusIdentifier);
    }

    getLowercasedCertificateThumbprint(certificateFingerprint: string): string {
        if (!certificateFingerprint) {
            return '';
        }
        return certificateFingerprint.replaceAll(':', '').toLowerCase();
    }

    createOperatorPublicConfigurationNotificationMessage(): OperatorPublicConfigurationNotificationMessage {
        const qrCodeSignInSetting = this.state.systemSettings.find(x => x.name === SystemSettingsName.feature_qrcode_sign_in_enabled);
        const msg = createOperatorPublicConfigurationNotificationMessage();
        msg.body.featureFlags = {
            codeSignIn: qrCodeSignInSetting?.value?.trim()?.toLowerCase() === 'yes',
        };
        msg.body.authenticationTimeoutSeconds = this.state.authenticationTimeout / 1000;
        return msg;
    }

    createOperatorConfigurationMessage(): OperatorConfigurationNotificationMessage {
        const configurationMsg = createOperatorConfigurationNotificationMessage();
        // TODO: Add other values here
        configurationMsg.body.pingInterval = this.state.pingInterval;
        return configurationMsg;
    }

    processOperatorSendError(args: SendErrorEventArgs): void {
        this.logger.warn('Send error', args);
    }

    processOperatorServerError(args: ServerErrorEventArgs): void {
        this.logger.warn('Server error', args);
    }

    processOperatorServerListening(): void {
        const wssServer = this.wssServer.getWebSocketServer();
        const httpsServer = this.wssServer.getHttpsServer();
        this.logger.log('Operator WebSocket server is listening at', wssServer.address(), ', https server is listening at', httpsServer.address());
    }

    getConnectedClientData(connectionId: number): ConnectedClientData | undefined {
        return this.connectedClients.get(connectionId);
    }

    setConnectedClientData(data: ConnectedClientData): void {
        this.connectedClients.set(data.connectionId, data);
    }

    getAllConnectedClientsData(): [number, ConnectedClientData][] {
        return Array.from(this.connectedClients.entries());
    }

    sendReplyMessageToOperator<TBody>(message: OperatorReplyMessage<TBody>, clientData: ConnectedClientData, requestMessage?: OperatorRequestMessage<unknown>): void {
        if (requestMessage) {
            message.header.correlationId = requestMessage.header.correlationId;
        }
        if (message.header.failure) {
            message.header.requestType = requestMessage?.header?.type;
        }
        clientData.sentMessagesCount++;
        this.logger.log('Sending reply message to operator connection', clientData.connectionId, message.header.type, message);
        this.wssServer.sendJSON(message, clientData.connectionId);
    }

    // sendMessageToOperator<TBody>(message: OperatorRequestMessage<TBody>, clientData: ConnectedClientData, requestMessage: OperatorRequestMessage<any> | null): void {
    //     if (requestMessage) {
    //         message.header.correlationId = requestMessage.header.correlationId;
    //     }
    //     clientData.sentMessagesCount++;
    //     this.logger.log('Sending message to operator connection', clientData.connectionId, message.header.type, message);
    //     this.wssServer.sendJSON(message, clientData.connectionId);
    // }

    sendNotificationMessageToOperator<TBody>(message: OperatorNotificationMessage<TBody>, clientData: ConnectedClientData): void {
        clientData.sentMessagesCount++;
        this.logger.log('Sending notification message to operator', clientData, message.header.type, message);
        this.wssServer.sendJSON(message, clientData.connectionId);
    }

    sendNotificationMessageToAllAuthenticatedOperators<TBody>(message: OperatorNotificationMessage<TBody>): void {
        const allConnectedClientsData = this.getAllConnectedClientsData();
        for (const item of allConnectedClientsData) {
            const clientData = item[1];
            if (clientData.isAuthenticated) {
                clientData.sentMessagesCount++;
                this.logger.log('Sending notification message to operator', clientData, message.header.type, message);
                this.wssServer.sendJSON(message, clientData.connectionId);
            }
        }
    }

    sendNotificationMessageToAllOperators<TBody>(message: OperatorNotificationMessage<TBody>): void {
        const allConnectedClientsData = this.getAllConnectedClientsData();
        for (const item of allConnectedClientsData) {
            const clientData = item[1];
            clientData.sentMessagesCount++;
            this.logger.log('Sending notification message to operator', clientData, message.header.type, message);
            this.wssServer.sendJSON(message, clientData.connectionId);
        }
    }

    startMainTimer(): void {
        this.state.mainTimerHandle = setInterval(() => this.mainTimerCallback(), 5000);
    }

    startClientConnectionsMonitor(): void {
        this.state.clientConnectionsMonitorTimerHandle = setInterval(() => this.cleanUpClientConnections(), this.state.cleanUpClientConnectionsInterval);
    }

    mainTimerCallback(): void {
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

    async removeCodeSignInForConnectionInstanceId(connectionInstanceId: string): Promise<void> {
        if (!connectionInstanceId) {
            return;
        }
        const keys = await this.cacheHelper.getAllCodeSignInKeys();
        for (const key of keys) {
            const cacheItem: CodeSignIn | null = await this.cacheHelper.getValue(key);
            if (cacheItem && cacheItem.connectionInstanceId === connectionInstanceId) {
                await this.cacheHelper.deleteKey(key);
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

    async maintainUserAuthDataTokenCacheItem(
        userId: number,
        connectedAt: number,
        permissions: PermissionName[],
        token: string,
        roundtripData: OperatorConnectionRoundTripData,
        username: string,
    ): Promise<void> {
        // TODO: Should we delete the previous cache items ?
        const now = this.getNowAsNumber();
        const authData: UserAuthDataCacheValue = {
            permissions: permissions,
            roundtripData: roundtripData,
            setAt: now,
            token: token,
            // TODO: Get token expiration from configuration
            tokenExpiresAt: now + this.state.tokenExpirationMilliseconds,
            userId: userId,
            username: username,
            connectedAt: connectedAt,
        };
        const userAuthDataCacheKey = this.cacheHelper.getUserAuthDataKey(userId, roundtripData.connectionInstanceId);
        await this.cacheClient.setValue(userAuthDataCacheKey, authData);
        const authTokenCacheKey = this.cacheHelper.getUserAuthTokenKey(token);
        await this.cacheClient.setValue(authTokenCacheKey, authData);
    }

    createUUIDString(): string {
        return randomUUID().toString();
    }

    isWhiteSpace(string?: string): boolean {
        return !(string?.trim());
    }

    getNowAsNumber(): number {
        return Date.now();
    }

    getNowAsIsoString(): string {
        return new Date().toISOString();
    }

    createValidators(): OperatorConnectorValidators {
        const validators: OperatorConnectorValidators = {
            tariff: new TariffValidator(),
        };
        return validators;
    }

    createState(): OperatorConnectorState {
        // Operator apps must authenticate within 3 minutes after connected or will be disconnected
        const authenticationTimeout = 3 * 60 * 1000;
        const state: OperatorConnectorState = {
            // Operator apps must send at least one message each 3 minutes or will be disconnected
            idleTimeout: 3 * 60 * 1000,
            authenticationTimeout: authenticationTimeout,
            // Operator apps must ping the server each 10 seconds
            pingInterval: 10 * 1000,
            // Each 10 seconds the operator-connector will check operator connections and will close timed-out
            cleanUpClientConnectionsInterval: 10 * 1000,
            // The timeout for message bus messages to reply
            messageBusReplyTimeout: 5 * 1000,
            // Message statistics for operator channel
            operatorChannelMessageStatItems: [],
            clientConnectionsMonitorTimerHandle: undefined,
            mainTimerHandle: undefined,
            systemSettings: [],
            anonymousMessageTypesSet: new Set<string>([
                OperatorRequestMessageType.authRequest,
                OperatorRequestMessageType.createSignInCodeRequest,
            ]),
            // Equal to the authentication timeout + 10 seconds but not less than 3 minutes
            codeSignInDurationSeconds: Math.max(authenticationTimeout / 1000 + 10, 3 * 60),
            isQrCodeSignInFeatureEnabled: false,
            // 1 minute
            cleanUpCodeSignInInterval: 1 * 60 * 1000,
            // 30 minutes
            tokenExpirationMilliseconds: 1800000,
        };
        return state;
    }

    async isTokenActive(token?: string): Promise<IsTokenActiveResult> {
        const result: IsTokenActiveResult = { isActive: false };
        if (this.isWhiteSpace(token)) {
            // Token is not provided
            result.isActive = false;
            return result;
        }

        const authTokenCacheValue = await this.cacheHelper.getAuthTokenValue(token!);
        if (!authTokenCacheValue) {
            // There is no such token
            result.isActive = false;
            return result;
        }

        const now = this.getNowAsNumber();
        if (now > authTokenCacheValue.tokenExpiresAt) {
            // The token expired
            await this.cacheHelper.deleteAuthTokenKey(token!);
            return { isActive: false, authTokenCacheValue: authTokenCacheValue };
        }

        result.isActive = true;
        result.authTokenCacheValue = authTokenCacheValue;
        return result;
    }

    async start(): Promise<void> {
        this.requestMessageHandlerMap = new RequestMessageHandlerHelper().createOperatorRequestMessageHandlersMap();
        this.cacheHelper.initialize(this.cacheClient);
        this.subscribeToSubjects();
        await this.joinMessageBus();
        this.requestAllSystemSettings();
        this.startWebSocketServer();
        this.startMainTimer();
        this.startClientConnectionsMonitor();
        this.serveStaticFiles();
    }

    applySystemSettings(systemSettings: SystemSetting[]): void {
        // TODO: Set this.state values according to systemSettings
        this.state.isQrCodeSignInFeatureEnabled = systemSettings.find(x => x.name === SystemSettingsName.feature_qrcode_sign_in_enabled)?.value?.trim() === 'yes';
        const tokenDurationSystemSettingTextValue = systemSettings.find(x => x.name === SystemSettingsName.token_duration)?.value?.trim();
        const tokenDurationValue = tokenDurationSystemSettingTextValue ? (+tokenDurationSystemSettingTextValue) * 1000 : 0;
        this.state.tokenExpirationMilliseconds = tokenDurationValue || this.state.tokenExpirationMilliseconds;
        const configurationMsg = this.createOperatorConfigurationMessage();
        this.sendNotificationMessageToAllAuthenticatedOperators(configurationMsg);
        const publicConfig = this.createOperatorPublicConfigurationNotificationMessage();
        this.sendNotificationMessageToAllOperators(publicConfig);
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

    subscribeToSubjects(): void {
        this.subjectsService.getMessageStat().subscribe(messageStatItem => {
            if (this.state.operatorChannelMessageStatItems.length > 1000) {
                // TODO: Implement ring buffer
                this.state.operatorChannelMessageStatItems.shift();
            }
            this.state.operatorChannelMessageStatItems.push(messageStatItem);
            if (messageStatItem.error) {
                this.logger.error('Message ended with error', messageStatItem);
            }
        });
    }

    processOperatorMessageReceived(args: MessageReceivedEventArgs): void {
        let msg: OperatorRequestMessage<unknown> | null;
        let type: OperatorRequestMessageType | undefined;
        try {
            msg = this.deserializeWebSocketBufferToMessage(args.buffer);
            type = msg?.header?.type;
            this.logger.log(`Received message '${type}' from operator, connection id ${args.connectionId}`, msg);
            if (!type) {
                return;
            }
            try {
                this.processOperatorMessage(args.connectionId, msg!);
            } catch (err) {
                this.logger.warn(`Can't process operator message '${type}'`, msg, args, err);
                return;
            }
        } catch (err) {
            this.logger.warn(`Can't deserialize operator message '${type}'`, args, err);
            return;
        }
    }

    async joinMessageBus(): Promise<void> {
        const redisHost = this.envVars.CCS3_REDIS_HOST.value;
        const redisPort = this.envVars.CCS3_REDIS_PORT.value;
        this.logger.log(`Using redis host ${redisHost} and port ${redisPort}`);

        await this.connectCacheClient(redisHost, redisPort);
        await this.connectPubClient(redisHost, redisPort);
        await this.connectSubClient(redisHost, redisPort);
    }

    processOperatorConnected(args: ClientConnectedEventArgs): void {
        this.logger.log('Operator connected', args);
        const clientData: ConnectedClientData = {
            connectionId: args.connectionId,
            connectionInstanceId: this.createUUIDString(),
            connectedAt: this.getNowAsNumber(),
            userId: null,
            certificate: args.certificate,
            certificateThumbprint: this.getLowercasedCertificateThumbprint(args.certificate?.fingerprint),
            ipAddress: args.ipAddress,
            lastMessageReceivedAt: null,
            receivedMessagesCount: 0,
            receivedPingMessagesCount: 0,
            sentMessagesCount: 0,
            isAuthenticated: false,
            headers: args.headers,
            permissions: new Set<PermissionName>(),
            unauthorizedMessageRequestsCount: 0,
        };
        this.setConnectedClientData(clientData);
        this.wssServer.attachToConnection(args.connectionId);
        const publicConfigMsg = this.createOperatorPublicConfigurationNotificationMessage();
        this.sendNotificationMessageToOperator(publicConfigMsg, clientData);
    }

    startWebSocketServer(): void {
        this.wssServer = new WssServer();
        const wssServerConfig: WssServerConfig = {
            cert: readFileSync(this.envVars.CCS3_OPERATOR_CONNECTOR_CERTIFICATE_CRT_FILE_PATH.value).toString(),
            key: readFileSync(this.envVars.CCS3_OPERATOR_CONNECTOR_CERTIFICATE_KEY_FILE_PATH.value).toString(),
            caCert: readFileSync(this.envVars.CCS3_OPERATOR_CONNECTOR_ISSUER_CERTIFICATE_CRT_FILE_PATH.value).toString(),
            port: this.envVars.CCS3_OPERATOR_CONNECTOR_PORT.value,
            // Currently, operators does not provide certificates so we will allow such connections
            requestCert: false,
            rejectUnauthorized: false,
        };
        this.wssServer.start(wssServerConfig);
        this.wssEmitter = this.wssServer.getEmitter();
        this.wssEmitter.on(WssServerEventName.clientConnected, args => this.processOperatorConnected(args));
        this.wssEmitter.on(WssServerEventName.connectionClosed, args => this.processOperatorConnectionClosed(args));
        this.wssEmitter.on(WssServerEventName.connectionError, args => this.processOperatorConnectionError(args));
        this.wssEmitter.on(WssServerEventName.messageReceived, args => this.processOperatorMessageReceived(args));
        this.wssEmitter.on(WssServerEventName.sendError, args => this.processOperatorSendError(args));
        this.wssEmitter.on(WssServerEventName.serverError, args => this.processOperatorServerError(args));
        this.wssEmitter.on(WssServerEventName.serverListening, () => this.processOperatorServerListening());
        this.logger.log(`WebSocket server listening at port ${this.envVars.CCS3_OPERATOR_CONNECTOR_PORT.value}`);
    }

    cleanUpClientConnections(): void {
        const connectionIdsWithCleanUpReason = new Map<number, ConnectionCleanUpReason>();
        const now = this.getNowAsNumber();
        for (const entry of this.connectedClients.entries()) {
            const connectionId = entry[0];
            const data = entry[1];
            if (!data.isAuthenticated) {
                if ((now - data.connectedAt) > this.state.authenticationTimeout) {
                    // Not authenticated for a long time since connected
                    connectionIdsWithCleanUpReason.set(connectionId, ConnectionCleanUpReason.authenticationTimeout);
                }
            } else if (data.lastMessageReceivedAt) {
                if ((now - data.lastMessageReceivedAt) > this.state.idleTimeout) {
                    // No message has been received for a long time since the last one
                    connectionIdsWithCleanUpReason.set(connectionId, ConnectionCleanUpReason.idleTimeout);
                }
            } else {
                // Never received message at this connection - use the time of connection
                if ((now - data.connectedAt) > this.state.idleTimeout) {
                    connectionIdsWithCleanUpReason.set(connectionId, ConnectionCleanUpReason.noMessagesReceived);
                }
            }
        }

        for (const entry of connectionIdsWithCleanUpReason.entries()) {
            const connectionId = entry[0];
            const clientData = this.getConnectedClientData(connectionId);
            this.logger.warn(`Disconnecting client ${connectionId}`, entry[1], clientData);
            if (clientData?.userId) {
                const note = JSON.stringify({
                    connectionId: entry[0],
                    connectionCleanUpReason: entry[1],
                    clientData: clientData,
                });
                this.publishOperatorConnectionEventMessage(clientData.userId, clientData.ipAddress, OperatorConnectionEventType.idleTimeout, note);
            }
            this.removeClient(connectionId);
            this.wssServer.closeConnection(connectionId);
            if (this.state.isQrCodeSignInFeatureEnabled && clientData) {
                this.removeCodeSignInForConnectionInstanceId(clientData.connectionInstanceId);
            }
        }
    }

    serveStaticFiles(): void {
        // TODO: The static files server must add "charset=utf-8" to all text-based responses like "text/html;charset=utf-8"
        // TODO: The static files server must return "cache-control" response header. Supporting caching is desirable
        const noStaticFilesServing = this.envVars.CCS3_OPERATOR_CONNECTOR_NO_STATIC_FILES_SERVING.value;
        if (!noStaticFilesServing) {
            const staticFilesPath = this.envVars.CCS3_OPERATOR_CONNECTOR_STATIC_FILES_PATH.value;
            const config = {
                notFoundFile: './index.html',
                path: staticFilesPath,
            } as IStaticFilesServerConfig;
            this.staticFilesServer = new StaticFilesServer(config, this.wssServer.getHttpsServer());
            this.staticFilesServer.start();
            const resolvedStaticFilesPath = this.staticFilesServer.getResolvedPath();
            const staticFilesPathExists = existsSync(resolvedStaticFilesPath);
            if (staticFilesPathExists) {
                this.logger.log(`Serving static files from ${resolvedStaticFilesPath}`);
            } else {
                this.logger.warn(`Static files path ${resolvedStaticFilesPath} does not exist`);
            }
        }
    }

    async connectSubClient(redisHost: string, redisPort: number): Promise<void> {
        const subClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.logger.error('SubClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                this.logger.error(`SubClient reconnect strategy error. Retries ${retries}`, err);
                return 5000;
            },
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
        await this.subClient.subscribe(ChannelName.operators);
        this.logger.log('SubClient subscribed to the channels');
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
                this.logger.error(`CacheClient reconnect strategy error. Retries ${retries}`, err);
                return 5000;
            },
        };
        this.logger.log('CacheClient connecting');
        await this.cacheClient.connect(redisCacheClientOptions);
        this.logger.log('CacheClient connected');
    }

    async terminate(): Promise<void> {
        this.logger.warn('Terminating');
        clearInterval(this.state.clientConnectionsMonitorTimerHandle);
        clearInterval(this.state.mainTimerHandle);
        this.staticFilesServer?.stop();
        this.wssServer.stop();
        await this.subClient.disconnect();
        await this.pubClient.disconnect();
        await this.cacheClient.disconnect();
    }
}
