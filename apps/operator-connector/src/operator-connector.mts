import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';

import { CreateConnectedRedisClientOptions, RedisCacheClient, RedisClientMessageCallback, RedisPubClient, RedisSubClient } from '@computerclubsystem/redis-client';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { MessageType } from '@computerclubsystem/types/messages/declarations/message-type.mjs';
import { BusDeviceStatusesMessage } from '@computerclubsystem/types/messages/bus/bus-device-statuses.message.mjs';
import {
    ClientConnectedEventArgs, ConnectionClosedEventArgs, ConnectionErrorEventArgs,
    MessageReceivedEventArgs, WssServer, WssServerConfig, WssServerEventName, SendErrorEventArgs,
    ServerErrorEventArgs
} from '@computerclubsystem/websocket-server';
import { OperatorAuthRequestMessage } from '@computerclubsystem/types/messages/operators/operator-auth-request.message.mjs';
import { createBusOperatorAuthRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-auth-request.message.mjs';
import { BusOperatorAuthReplyMessage } from '@computerclubsystem/types/messages/bus/bus-operator-auth-reply.message.mjs';
import { createBusOperatorConnectionEventMessage } from '@computerclubsystem/types/messages/bus/bus-operator-connection-event.message.mjs';
import { OperatorConnectionEventType } from '@computerclubsystem/types/entities/operator-connection-event-type.mjs';
import { createOperatorAuthReplyMessage } from '@computerclubsystem/types/messages/operators/operator-auth-reply.message.mjs';
import { Logger } from './logger.mjs';
import { IStaticFilesServerConfig, StaticFilesServer } from './static-files-server.mjs';
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { OperatorMessage, OperatorNotificationMessage, OperatorReplyMessage } from '@computerclubsystem/types/messages/operators/declarations/operator.message.mjs';
import { OperatorMessageType, OperatorNotificationMessageType, OperatorReplyMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { createOperatorConfigurationMessage, OperatorConfigurationMessage } from '@computerclubsystem/types/messages/operators/operator-configuration.message.mjs';
import { OperatorPingRequestMessage } from '@computerclubsystem/types/messages/operators/operator-ping-request.message.mjs';
import { CacheHelper, UserAuthDataCacheValue } from './cache-helper.mjs';
import { CanProcessOperatorMessageResult, CanProcessOperatorMessageResultErrorReason, ConnectedClientData, ConnectionCleanUpReason, IsAuthorizedResult, IsAuthorizedResultReason, IsTokenActiveResult, MessageStatItem, OperatorConnectorState, OperatorConnectorValidators } from './declarations.mjs';
import { OperatorRefreshTokenRequestMessage } from '@computerclubsystem/types/messages/operators/operator-refresh-token-request.message.mjs';
import { createOperatorRefreshTokenReplyMessage } from '@computerclubsystem/types/messages/operators/operator-refresh-token-reply.message.mjs';
import { createOperatorNotAuthenticatedMessage } from '@computerclubsystem/types/messages/operators/operator-not-authenticated.message.mjs';
import { OperatorSignOutRequestMessage } from '@computerclubsystem/types/messages/operators/operator-sign-out-request.message.mjs';
import { createOperatorSignOutReplyMessage } from '@computerclubsystem/types/messages/operators/operator-sign-out-reply.message.mjs';
import { AuthorizationHelper } from './authorization-helper.mjs';
import { OperatorGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-devices-request.message.mjs';
import { createBusOperatorGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-get-all-devices-request.message.mjs';
import { SubjectsService } from './subjects.service.mjs';
import { catchError, EMPTY, filter, finalize, first, NEVER, Observable, of, throwError, timeout } from 'rxjs';
import { createOperatorGetAllDevicesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-devices-reply.message.mjs';
import { BusOperatorGetAllDevicesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-operator-get-all-devices-reply.message.mjs';
import { OperatorGetDeviceByIdRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-by-id-request.message.mjs';
import { createBusDeviceGetByIdRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id-request.message.mjs';
import { BusDeviceGetByIdReplyMessage, BusDeviceGetByIdReplyMessageBody, createBusDeviceGetByIdReplyMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id-reply.message.mjs';
import { createOperatorGetDeviceByIdReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-by-id-reply.message.mjs';
import { OperatorUpdateDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-device-request.message.mjs';
import { createOperatorUpdateDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-device-reply.message.mjs';
import { createBusUpdateDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-request.message.mjs';
import { BusUpdateDeviceReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-update-device-reply.message.mjs';
import { OperatorGetAllTariffsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-tariffs-request.message.mjs';
import { BusGetAllTariffsReplyMessageBody, createBusGetAllTariffsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-tariffs-reply.message.mjs';
import { createBusGetAllTariffsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-tariffs-request.message.mjs';
import { createOperatorGetAllTariffsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-tariffs-reply.message.mjs';
import { OperatorCreateTariffRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-tariff-request.message.mjs';
import { createOperatorCreateTariffReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-tariff-reply.message.mjs';
import { createBusCreateTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-tariff-request.message.mjs';
import { BusCreateTariffReplyMessage, BusCreateTariffReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-tariff-reply.message.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { Tariff } from '@computerclubsystem/types/entities/tariff.mjs';
import { TariffValidator } from './tariff-validator.mjs';
import { error } from 'node:console';
import { createOperatorDeviceStatusesNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-device-statuses-notification.message.mjs';
import { OperatorDeviceStatus } from '@computerclubsystem/types/entities/operator-device-status.mjs';
import { OperatorStartDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-start-device-request.message.mjs';
import { createBusStartDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-start-device-request.message.mjs';
import { createOperatorStartDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-start-device-reply.message.mjs';
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
    private readonly subjectsService = new SubjectsService();

    private wssServer!: WssServer;
    private wssEmitter!: EventEmitter;
    private connectedClients = new Map<number, ConnectedClientData>();

    processOperatorConnected(args: ClientConnectedEventArgs): void {
        this.logger.log('Operator connected', args);
        const data: ConnectedClientData = {
            connectionId: args.connectionId,
            connectionInstanceId: this.createUUIDString(),
            connectedAt: this.getNowAsNumber(),
            operatorId: null,
            certificate: args.certificate,
            certificateThumbprint: this.getLowercasedCertificateThumbprint(args.certificate?.fingerprint),
            ipAddress: args.ipAddress,
            lastMessageReceivedAt: null,
            receivedMessagesCount: 0,
            receivedPingMessagesCount: 0,
            sentMessagesCount: 0,
            isAuthenticated: false,
            headers: args.headers,
            permissions: new Set<string>(),
            unauthorizedMessageRequestsCount: 0,
        };
        this.setConnectedClientData(data);
        this.wssServer.attachToConnection(args.connectionId);
    }

    async processOperatorMessage(connectionId: number, message: OperatorMessage<any>): Promise<void> {
        const clientData = this.getConnectedClientData(connectionId);
        if (!clientData) {
            return;
        }

        // TODO: Check counters like clientData.unauthorizedMessageRequestsCount and close the connection if maximum is reached
        if (clientData.unauthorizedMessageRequestsCount > 100) {
            return;
        }

        const canProcessOperatorMessageResult = await this.canProcessOperatorMessage(clientData, message);
        if (!canProcessOperatorMessageResult.canProcess) {
            if (canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.notAuthorized) {
                clientData.unauthorizedMessageRequestsCount++;
            }
            this.logger.log(`Can't process operator message`, canProcessOperatorMessageResult, message, clientData);
            if (canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenExpired
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenNotFound
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenNotProvided
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.messageRequiresAuthentication
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.notAuthorized) {
                // Send not authenticated
                const notAuthenticatedMsg = createOperatorNotAuthenticatedMessage();
                notAuthenticatedMsg.header.correlationId = message.header?.correlationId;
                notAuthenticatedMsg.body.requestedMessageType = message.header?.type;
                this.sendMessageToOperator(notAuthenticatedMsg, clientData);
            }
            return;
        }

        clientData.lastMessageReceivedAt = this.getNowAsNumber();
        clientData.receivedMessagesCount++;
        const type = message.header.type;
        switch (type) {
            case OperatorMessageType.startDeviceRequest:
                this.processOperatorStartDeviceRequest(clientData, message as OperatorStartDeviceRequestMessage);
                break;
            case OperatorMessageType.createTariffRequest:
                this.processOperatorCreateTariffRequest(clientData, message as OperatorCreateTariffRequestMessage);
                break;
            case OperatorMessageType.getAllTariffsRequest:
                this.processOperatorGetAllTariffsRequest(clientData, message as OperatorGetAllTariffsRequestMessage);
                break;
            case OperatorMessageType.updateDeviceRequest:
                this.processOperatorUpdateDeviceRequest(clientData, message as OperatorUpdateDeviceRequestMessage);
                break;
            case OperatorMessageType.getAllDevicesRequest:
                this.processOperatorGetAllDevicesRequest(clientData, message as OperatorGetAllDevicesRequestMessage);
                break;
            case OperatorMessageType.getDeviceByIdRequest:
                this.processOperatorGetDeviceByIdRequest(clientData, message as OperatorGetDeviceByIdRequestMessage);
                break;
            case OperatorMessageType.authRequest:
                this.processOperatorAuthRequestMessage(clientData, message as OperatorAuthRequestMessage);
                break;
            case OperatorMessageType.refreshTokenRequest:
                this.processOperatorRefreshTokenRequestMessage(clientData, message as OperatorRefreshTokenRequestMessage);
                break;
            case OperatorMessageType.signOutRequest:
                this.processOperatorSignOutRequestMessage(clientData, message as OperatorSignOutRequestMessage);
                break;
            case OperatorMessageType.pingRequest:
                clientData.receivedPingMessagesCount++;
                this.processOperatorPingRequestMessage(clientData, message as OperatorPingRequestMessage);
                break;
        }
    }

    processOperatorStartDeviceRequest(clientData: ConnectedClientData, message: OperatorStartDeviceRequestMessage): void {
        // Validate
        const busRequestMsg = createBusStartDeviceRequestMessage();
        busRequestMsg.body.deviceId = message.body.deviceId;
        busRequestMsg.body.tariffId = message.body.tariffId;
        this.publishToOperatorsChannelAndWaitForReplyByType<BusCreateTariffReplyMessageBody>(busRequestMsg, MessageType.busStartDeviceReply, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorStartDeviceReplyMessage();
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    if (busReplyMsg.header.errors?.find(x => x.code === 'device-already-started')) {
                        operatorReplyMsg.header.errors = [{
                            code: OperatorReplyMessageErrorCode.deviceAlreadyStarted,
                            description: `Can't start the device. Check if it is already started`,
                        }] as MessageError[];
                    } else {
                        operatorReplyMsg.header.errors = [{
                            code: OperatorReplyMessageErrorCode.cantStartDevice,
                            description: `Can't start the device. Check if it is already started`,
                        }] as MessageError[];
                    }
                    // TODO: Set error in the response header. For this to work we need to have different request and reply headers
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorCreateTariffRequest(clientData: ConnectedClientData, message: OperatorCreateTariffRequestMessage): void {
        const errorReplyMsg = this.validators.tariff.validateTariff(message.body.tariff);
        if (errorReplyMsg?.body.tariff.idmnj) {
            this.sendReplyMessageToOperator(errorReplyMsg, clientData, message);
            return;
        }
        const requestedTariff: Tariff = message.body.tariff;
        requestedTariff.description = requestedTariff.description?.trim();
        requestedTariff.name = requestedTariff.name.trim();

        const busRequestMsg = createBusCreateTariffRequestMessage();
        busRequestMsg.body.tariff = requestedTariff;
        this.publishToOperatorsChannelAndWaitForReplyByType<BusCreateTariffReplyMessageBody>(busRequestMsg, MessageType.busCreateTariffReply, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateTariffReplyMessage();
                operatorReplyMsg.body.tariff = busReplyMsg.body.tariff;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = [{
                        code: OperatorReplyMessageErrorCode.tariffCreationError,
                        description: `Can't create tariff. Check if tariff with the same name already exist`,
                    }] as MessageError[];
                    // TODO: Set error in the response header. For this to work we need to have different request and reply headers
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllTariffsRequest(clientData: ConnectedClientData, message: OperatorGetAllTariffsRequestMessage): void {
        // TODO: Remove "as any"
        const busRequestMsg = createBusGetAllTariffsRequestMessage(message as any);
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReplyByType<BusGetAllTariffsReplyMessageBody>(busRequestMsg, MessageType.busGetAllTariffsReply, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetAllTariffsReplyMessage();
                operatorReplyMsg.body.tariffs = busReplyMessage.body.tariffs;
                if (busReplyMessage.header.failure) {
                    // TODO: Set error in the response header. For this to work we need to have different request and reply headers
                }
                this.sendMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorUpdateDeviceRequest(clientData: ConnectedClientData, message: OperatorUpdateDeviceRequestMessage): void {
        const busRequestMsg = createBusUpdateDeviceRequestMessage();
        busRequestMsg.body.device = message.body.device;
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReplyByType<BusUpdateDeviceReplyMessageBody>(busRequestMsg, MessageType.busUpdateDeviceReply, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorUpdateDeviceReplyMessage();
                operatorReplyMsg.body.device = busReplyMessage.body.device;
                if (busReplyMessage.header.failure) {
                    // TODO: Set error in the response header. For this to work we need to have different request and reply headers
                }
                this.sendMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    async processOperatorGetDeviceByIdRequest(clientData: ConnectedClientData, message: OperatorGetDeviceByIdRequestMessage): Promise<void> {
        const busRequestMsg = createBusDeviceGetByIdRequestMessage();
        busRequestMsg.body.deviceId = message.body.deviceId;
        // TODO: Do we need this roundTripData ? We are now waiting for reply by type
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReplyByType<BusDeviceGetByIdReplyMessageBody>(busRequestMsg, MessageType.busOperatorGetDeviceByIdReply, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetDeviceByIdReplyMessage();
                operatorReplyMsg.body.device = busReplyMessage.body.device;
                this.sendMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    async processOperatorGetAllDevicesRequest(clientData: ConnectedClientData, message: OperatorGetAllDevicesRequestMessage): Promise<void> {
        const busRequestMsg = createBusOperatorGetAllDevicesRequestMessage(message);
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReplyByType<BusOperatorGetAllDevicesReplyMessageBody>(busRequestMsg, MessageType.busOperatorGetAllDevicesReply, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetAllDevicesReplyMessage();
                operatorReplyMsg.body.devices = busReplyMessage.body.devices;
                this.sendMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    publishToOperatorsChannelAndWaitForReplyByType<TReplyBody>(busMessage: Message<any>, expectedReplyType: MessageType, clientData: ConnectedClientData): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            replyType: expectedReplyType,
            type: busMessage.header.type,
            completedAt: 0,
            operatorId: clientData.operatorId,
        };
        return this.publishToOperatorsChannel(busMessage).pipe(
            filter(msg => msg.header.type === expectedReplyType),
            first(),
            timeout(this.state.messageBusReplyTimeout),
            catchError(err => {
                messageStatItem.error = err;
                // TODO: This will complete the observable. The subscriber will not know about the error/timeout
                return of();
            }),
            finalize(() => {
                messageStatItem.completedAt = this.getNowAsNumber();
                this.subjectsService.setOperatorsChannelMessageStat(messageStatItem);
            }),
        );
    }

    async processOperatorSignOutRequestMessage(clientData: ConnectedClientData, message: OperatorSignOutRequestMessage): Promise<void> {
        const token = message.header.token!;
        if (this.isWhiteSpace(token)) {
            return;
        }
        const cachedTokenValue = await this.cacheHelper.getAuthTokenValue(token);
        if (!cachedTokenValue) {
            return;
        }
        await this.cacheHelper.deleteAuthTokenKey(cachedTokenValue.token);
        await this.cacheHelper.deleteUserAuthDataKey(cachedTokenValue.userId, cachedTokenValue.roundtripData.connectionInstanceId);
        const replyMsg = createOperatorSignOutReplyMessage();
        // Received and sent is the opposite for the client and the server
        // Recevied for the client are sent by the server
        replyMsg.body.receivedMessagesCount = clientData.sentMessagesCount;
        replyMsg.body.sentMessagesCount = clientData.receivedMessagesCount;
        replyMsg.body.sentPingMessagesCount = clientData.receivedPingMessagesCount;
        replyMsg.body.sessionStart = clientData.connectedAt;
        replyMsg.body.sessionEnd = this.getNowAsNumber();
        this.sendMessageToOperator(replyMsg, clientData, message);
    }

    async processOperatorRefreshTokenRequestMessage(clientData: ConnectedClientData, message: OperatorRefreshTokenRequestMessage): Promise<void> {
        // TODO: This is almost the same as processOperatorAuthRequestWithToken()
        const requestToken = message.body.currentToken;
        const refreshTokenReplyMsg = createOperatorRefreshTokenReplyMessage();
        const isTokenActiveResult = await this.isTokenActive(requestToken);
        if (!isTokenActiveResult.isActive) {
            // Token is provided but is not active
            if (isTokenActiveResult.authTokenCacheValue?.token) {
                await this.cacheHelper.deleteAuthTokenKey(isTokenActiveResult.authTokenCacheValue?.token);
            }
            refreshTokenReplyMsg.body.success = false;
            this.sendMessageToOperator(refreshTokenReplyMsg, clientData, message);
            if (isTokenActiveResult.authTokenCacheValue) {
                const operatorId = clientData.operatorId || isTokenActiveResult.authTokenCacheValue.userId;
                const note = JSON.stringify({
                    requestToken: requestToken,
                    clientData: clientData,
                    authTokenCacheValue: isTokenActiveResult.authTokenCacheValue,
                });
                this.publishOperatorConnectionEventMessage(operatorId, clientData.ipAddress, OperatorConnectionEventType.refreshTokenFailed, note);
            }
            return;
        }
        // The token is active - generate new one and remove the old one
        refreshTokenReplyMsg.body.success = true;
        const newToken = this.createUUIDString();
        refreshTokenReplyMsg.body.token = newToken;
        const authTokenCacheValue = isTokenActiveResult.authTokenCacheValue!;
        const prevConnectionInstanceId = authTokenCacheValue.roundtripData.connectionInstanceId;
        authTokenCacheValue.token = newToken;
        const now = this.getNowAsNumber();
        authTokenCacheValue.setAt = now;
        const mergedRoundTripData: OperatorConnectionRoundTripData = {
            ...authTokenCacheValue.roundtripData,
            ...this.createRoundTripDataFromConnectedClientData(clientData),
        }
        authTokenCacheValue.roundtripData = mergedRoundTripData;
        authTokenCacheValue.tokenExpiresAt = authTokenCacheValue.setAt + this.getTokenExpirationMilliseconds();
        refreshTokenReplyMsg.body.tokenExpiresAt = authTokenCacheValue.tokenExpiresAt;
        // Delete cache for previous token
        await this.cacheHelper.deleteAuthTokenKey(requestToken);
        await this.cacheHelper.deleteUserAuthDataKey(authTokenCacheValue.userId, prevConnectionInstanceId);
        // Set the new cache items
        await this.cacheHelper.setAuthTokenValue(authTokenCacheValue);
        await this.cacheHelper.setUserAuthData(authTokenCacheValue);
        // Mark operator as authenticated
        clientData.isAuthenticated = true;
        clientData.permissions = new Set<string>(authTokenCacheValue.permissions);
        const operatorId = clientData.operatorId || authTokenCacheValue.userId;
        clientData.operatorId = operatorId;
        // Send messages back to the operator
        this.sendMessageToOperator(refreshTokenReplyMsg, clientData, message);
        const note = JSON.stringify({
            clientData: clientData,
            authReplyMsg: refreshTokenReplyMsg,
        });
        this.publishOperatorConnectionEventMessage(operatorId!, clientData.ipAddress, OperatorConnectionEventType.tokenRefreshed, note);
    }

    async processOperatorAuthRequestMessage(clientData: ConnectedClientData, message: OperatorAuthRequestMessage): Promise<void> {
        if (!message?.body) {
            return;
        }

        if (!this.isWhiteSpace(message.body.token)) {
            const isTokenProcessed = await this.processOperatorAuthRequestWithToken(clientData, message);
            if (!isTokenProcessed) {
                // Token is invalid
                return;
            }
        }

        const isUsernameEmpty = this.isWhiteSpace(message.body.username);
        const isPasswordEmpty = this.isWhiteSpace(message.body.passwordHash);
        if (isUsernameEmpty && isPasswordEmpty) {
            return;
        }

        const msg = createBusOperatorAuthRequestMessage();
        msg.body.passwordHash = message.body.passwordHash;
        msg.body.username = message.body.username;
        msg.header.roundTripData = this.createRoundTripDataFromConnectedClientData(clientData);
        this.publishToOperatorsChannel(msg);
    }

    /**
     * 
     * @param clientData 
     * @param message 
     * @returns true if success
     */
    async processOperatorAuthRequestWithToken(clientData: ConnectedClientData, message: OperatorAuthRequestMessage): Promise<boolean> {
        const requestToken = message.body.token!;
        const authReplyMsg = createOperatorAuthReplyMessage();
        const isTokenActiveResult = await this.isTokenActive(requestToken);
        if (!isTokenActiveResult.isActive) {
            // Token is provided but is not active
            if (isTokenActiveResult.authTokenCacheValue?.token) {
                await this.cacheHelper.deleteAuthTokenKey(isTokenActiveResult.authTokenCacheValue?.token);
            }
            authReplyMsg.body.success = false;
            this.sendMessageToOperator(authReplyMsg, clientData);
            if (isTokenActiveResult.authTokenCacheValue) {
                const operatorId = clientData.operatorId || isTokenActiveResult.authTokenCacheValue.userId;
                const note = JSON.stringify({
                    requestToken: requestToken,
                    clientData: clientData,
                    authTokenCacheValue: isTokenActiveResult.authTokenCacheValue,
                });
                this.publishOperatorConnectionEventMessage(operatorId, clientData.ipAddress, OperatorConnectionEventType.usedExpiredToken, note);
            }
            return false;
        }
        // The token is active - generate new one and remove the old one
        authReplyMsg.body.success = true;
        const newToken = this.createUUIDString();
        authReplyMsg.body.token = newToken;
        const authTokenCacheValue = isTokenActiveResult.authTokenCacheValue!;
        const prevConnectionInstanceId = authTokenCacheValue.roundtripData.connectionInstanceId;
        authTokenCacheValue.token = newToken;
        const now = this.getNowAsNumber();
        authTokenCacheValue.setAt = now;
        const mergedRoundTripData: OperatorConnectionRoundTripData = {
            ...authTokenCacheValue.roundtripData,
            ...this.createRoundTripDataFromConnectedClientData(clientData),
        }
        authTokenCacheValue.roundtripData = mergedRoundTripData;
        // TODO: Get token expiration from configuration
        // The token expiration time is returned in seconds
        authTokenCacheValue.tokenExpiresAt = authTokenCacheValue.setAt + this.getTokenExpirationMilliseconds();
        authReplyMsg.body.tokenExpiresAt = authTokenCacheValue.tokenExpiresAt;
        // Delete cache for previous token
        await this.cacheHelper.deleteAuthTokenKey(requestToken);
        await this.cacheHelper.deleteUserAuthDataKey(authTokenCacheValue.userId, prevConnectionInstanceId);
        // Set the new cache items
        await this.cacheHelper.setAuthTokenValue(authTokenCacheValue);
        await this.cacheHelper.setUserAuthData(authTokenCacheValue);
        // Mark operator as authenticated
        clientData.isAuthenticated = true;
        clientData.permissions = new Set<string>(authTokenCacheValue.permissions);
        const operatorId = clientData.operatorId || authTokenCacheValue.userId;
        clientData.operatorId = operatorId;
        // Send messages back to the operator
        this.sendMessageToOperator(authReplyMsg, clientData);
        const configurationMsg = this.createOperatorConfigurationMessage();
        this.sendMessageToOperator(configurationMsg, clientData);
        const note = JSON.stringify({
            clientData: clientData,
            authReplyMsg: authReplyMsg,
        });
        this.publishOperatorConnectionEventMessage(operatorId!, clientData.ipAddress, OperatorConnectionEventType.tokenAuthSuccess, note);
        return true;
    }

    createRoundTripDataFromConnectedClientData(clientData: ConnectedClientData): OperatorConnectionRoundTripData {
        const roundTripData: OperatorConnectionRoundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId
        };
        return roundTripData;
    }

    processOperatorPingRequestMessage(clientData: ConnectedClientData, message: OperatorPingRequestMessage): void {
        // TODO: Do we need to do something on ping ? The lastMessageReceivedAt is already set
    }

    processBusMessageReceived(channelName: string, message: Message<any>): void {
        if (this.isOwnMessage(message)) {
            return;
        }
        this.logger.log('Received channel', channelName, 'message', message.header.type, message);
        switch (channelName) {
            case ChannelName.operators:
                this.processOperatorsBusMessage(message);
            case ChannelName.devices:
                this.processDevicesBusMessage(message);
                break;
            case ChannelName.shared:
                break;
        }
    }

    processOperatorsBusMessage<TBody>(message: Message<TBody>): void {
        this.subjectsService.setOperatorsChannelBusMessageReceived(message);
        const type = message.header.type;
        switch (type) {
            case MessageType.busOperatorAuthReply:
                this.processBusOperatorAuthReplyMessage(message as BusOperatorAuthReplyMessage)
                break;
            default:
                // this.logger.log(`Unknown message received`, message);
                break;
        }
    }

    processBusOperatorAuthReplyMessage(message: BusOperatorAuthReplyMessage): void {
        const rtData = message.header.roundTripData! as OperatorConnectionRoundTripData;
        const clientData = this.getConnectedClientData(rtData.connectionId);
        if (!clientData) {
            return;
        }
        clientData.isAuthenticated = message.body.success;
        clientData.permissions = new Set<string>(message.body.permissions);
        clientData.operatorId = message.body.userId;
        const replyMsg = createOperatorAuthReplyMessage();
        replyMsg.body.permissions = message.body.permissions;
        replyMsg.body.success = message.body.success;
        if (replyMsg.body.success) {
            replyMsg.body.token = this.createUUIDString();
            replyMsg.body.tokenExpiresAt = this.getNowAsNumber() + this.getTokenExpirationMilliseconds();
            this.maintainUserAuthDataTokenCacheItem(clientData.operatorId!, replyMsg.body.permissions!, replyMsg.body.token, rtData);
        }
        this.sendMessageToOperator(replyMsg, clientData);
        if (message.body.success) {
            // Send configuration message
            // TODO: Get configuration from the database
            const configurationMsg = this.createOperatorConfigurationMessage();
            this.sendMessageToOperator(configurationMsg, clientData);

            const note = JSON.stringify({
                messageBody: message.body,
                clientData: clientData,
            });
            this.publishOperatorConnectionEventMessage(clientData.operatorId!, clientData.ipAddress, OperatorConnectionEventType.passwordAuthSuccess, note);
        }
    }

    async canProcessOperatorMessage<TBody>(clientData: ConnectedClientData, message: OperatorMessage<TBody>): Promise<CanProcessOperatorMessageResult> {
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
        const isAnonymousMessage = msgType === OperatorMessageType.authRequest;
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
            const isAuthorizedResult = this.authorizationHelper.isAuthorized(clientData.permissions, msgType);
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
        const type = message.header.type;
        switch (type) {
            case MessageType.busDeviceStatuses:
                this.processDeviceStatusesMessage(message as BusDeviceStatusesMessage);
                break;
        }
    }

    processDeviceStatusesMessage(message: BusDeviceStatusesMessage): void {
        // Send device statuses message to all connected operators that can read this information
        const clientDataToSendTo: ConnectedClientData[] = [];
        const connections = this.getAllConnectedClientsData();
        for (const connection of connections) {
            const clientData = connection[1];
            const isAuthorized = this.authorizationHelper.isAuthorized(clientData.permissions, OperatorNotificationMessageType.deviceStatusesNotification);
            if (isAuthorized) {
                clientDataToSendTo.push(clientData);
            }
        }

        if (clientDataToSendTo.length > 0) {
            const deviceStatuses = message.body.deviceStatuses;
            const deviceStatusesNotificationMsg = createOperatorDeviceStatusesNotificationMessage();
            deviceStatusesNotificationMsg.body.deviceStatuses = deviceStatuses.map(x => {
                const opDeviceStatus: OperatorDeviceStatus = {
                    deviceId: x.deviceId,
                    enabled: x.enabled,
                    expectedEndAt: x.expectedEndAt,
                    remainingSeconds: x.remainingSeconds,
                    started: x.started,
                    startedAt: x.startedAt,
                    stoppedAt: x.stoppedAt,
                    tariff: x.tariff,
                    totalSum: x.totalSum,
                    totalTime: x.totalTime,
                };
                return opDeviceStatus;
            });
            for (const clientData of clientDataToSendTo) {
                try {
                    this.sendNotificationMessageToOperator(deviceStatusesNotificationMsg, clientData);
                } catch (err) {
                    this.logger.warn(`Can't send to operator`, clientData, deviceStatusesNotificationMsg, err);
                }
            }
        }
    }

    processOperatorConnectionClosed(args: ConnectionClosedEventArgs): void {
        this.logger.log('Operator connection closed', args);
        // Check if we still have this connection before saving connection event - it might be already removed because of timeout
        const clientData = this.getConnectedClientData(args.connectionId);
        if (clientData?.operatorId) {
            const note = JSON.stringify({
                args: args,
                clientData: clientData,
            });
            this.publishOperatorConnectionEventMessage(clientData.operatorId!, clientData.ipAddress!, OperatorConnectionEventType.disconnected, note);
        }
        this.removeClient(args.connectionId);
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
            this.logger.warn(`Can't publish operator connection event message. Specified operatorId is null`, ipAddress, eventType, note);
            return;
        }
        const deviceConnectionEventMsg = createBusOperatorConnectionEventMessage();
        deviceConnectionEventMsg.body.operatorId = operatorId;
        deviceConnectionEventMsg.body.ipAddress = ipAddress;
        deviceConnectionEventMsg.body.type = eventType;
        deviceConnectionEventMsg.body.note = note;
        this.publishToOperatorsChannel(deviceConnectionEventMsg);
    }

    publishToOperatorsChannel<TBody>(message: Message<TBody>): Observable<Message<any>> {
        message.header.source = this.messageBusIdentifier;
        this.logger.log('Publishing message', ChannelName.operators, message.header.type, message);
        this.pubClient.publish(ChannelName.operators, JSON.stringify(message));
        return this.subjectsService.getOperatorsChannelBusMessageReceived();
    }

    getConnectedClientsDataByOperatorId(operatorId: number): [number, ConnectedClientData][] {
        const result: [number, ConnectedClientData][] = [];
        for (const item of this.getAllConnectedClientsData()) {
            const data = item[1];
            if (data.operatorId === operatorId) {
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

    deserializeBusMessageToMessage(text: string): Message<any> | null {
        const json = JSON.parse(text);
        return json as Message<any>;
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

    createOperatorConfigurationMessage(): OperatorConfigurationMessage {
        const configurationMsg = createOperatorConfigurationMessage();
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

    sendReplyMessageToOperator<TBody>(message: OperatorReplyMessage<TBody>, clientData: ConnectedClientData, requestMessage?: OperatorMessage<any>): void {
        if (requestMessage) {
            message.header.correlationId = requestMessage.header.correlationId;
        }
        clientData.sentMessagesCount++;
        this.logger.log('Sending reply message to operator connection', clientData.connectionId, message.header.type, message);
        this.wssServer.sendJSON(message, clientData.connectionId);
    }

    sendMessageToOperator<TBody>(message: OperatorMessage<TBody>, clientData: ConnectedClientData, requestMessage?: OperatorMessage<any>): void {
        if (requestMessage) {
            message.header.correlationId = requestMessage.header.correlationId;
        }
        clientData.sentMessagesCount++;
        this.logger.log('Sending message to operator connection', clientData.connectionId, message.header.type, message);
        this.wssServer.sendJSON(message, clientData.connectionId);
    }

    sendNotificationMessageToOperator<TBody>(message: OperatorNotificationMessage<TBody>, clientData: ConnectedClientData): void {
        clientData.sentMessagesCount++;
        this.logger.log('Sending notification message to operator', clientData, message.header.type, message);
        this.wssServer.sendJSON(message, clientData.connectionId);
    }

    startClientConnectionsMonitor(): void {
        this.state.clientConnectionsMonitorTimerHandle = setInterval(() => this.cleanUpClientConnections(), this.state.cleanUpClientConnectionsInterval);
    }

    async maintainUserAuthDataTokenCacheItem(
        userId: number,
        permissions: string[],
        token: string,
        roundtripData: OperatorConnectionRoundTripData,
    ): Promise<void> {
        // TODO: Should we delete the previous cache items ?
        const now = this.getNowAsNumber();
        const authData: UserAuthDataCacheValue = {
            permissions: permissions,
            roundtripData: roundtripData,
            setAt: now,
            token: token,
            // TODO: Get token expiration from configuration
            tokenExpiresAt: now + this.getTokenExpirationMilliseconds(),
            userId: userId,
        };
        const userAuthDataCacheKey = this.cacheHelper.getUserAuthDataKey(userId, roundtripData.connectionInstanceId);
        await this.cacheClient.setValue(userAuthDataCacheKey, authData);
        const authTokenCacheKey = this.cacheHelper.getAuthTokenKey(token);
        await this.cacheClient.setValue(authTokenCacheKey, authData);
    }

    getTokenExpirationMilliseconds(): number {
        // 30 minutes
        // TODO: Get this from configuration
        return 1800000;
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
        const state: OperatorConnectorState = {
            // Operator apps must send at least one message each 2 minutes or will be disconnected
            idleTimeout: 120 * 1000,
            // Operator apps must authenticate within 20 seconds after connected or will be disconnected
            authenticationTimeout: 30 * 1000,
            // Operator apps must ping the server each 10 seconds
            pingInterval: 10 * 1000,
            // Each 10 seconds the operator-connector will check operator connections and will close timed-out
            cleanUpClientConnectionsInterval: 10 * 1000,
            // The timeout for message bus messages to reply
            messageBusReplyTimeout: 5 * 1000,
            // Message statistics for operator channel
            operatorChannelMessageStatItems: [],
            clientConnectionsMonitorTimerHandle: undefined,
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
        this.cacheHelper.initialize(this.cacheClient);
        this.subscribeToSubjects();
        await this.joinMessageBus();
        this.startWebSocketServer();
        this.startClientConnectionsMonitor();
        this.serveStaticFiles();
    }

    subscribeToSubjects(): void {
        this.subjectsService.getOperatorsChannelMessageStat().subscribe(messageStatItem => {
            if (this.state.operatorChannelMessageStatItems.length > 1000) {
                // TODO: Implement ring buffer
                this.state.operatorChannelMessageStatItems.shift();
            }
            this.state.operatorChannelMessageStatItems.push(messageStatItem);
        });
    }

    processOperatorMessageReceived(args: MessageReceivedEventArgs): void {
        let msg: OperatorMessage<any> | null;
        let type: OperatorMessageType | undefined;
        try {
            msg = this.deserializeWebSocketBufferToMessage(args.buffer);
            type = msg?.header?.type;
            this.logger.log('Received message from operator, connection id', args.connectionId, type, msg);
            if (!type) {
                return;
            }
            try {
                this.processOperatorMessage(args.connectionId, msg!);
            } catch (err) {
                this.logger.warn(`Can't process operator message`, msg, args, err);
                return;
            }
        } catch (err) {
            this.logger.warn(`Can't deserialize operator message`, args, err);
            return;
        }
    }

    async joinMessageBus(): Promise<void> {
        const redisHost = this.envVars.CCS3_REDIS_HOST.value;
        const redisPort = this.envVars.CCS3_REDIS_PORT.value;
        this.logger.log('Using redis host', redisHost, 'and port', redisPort);

        await this.connectSubClient(redisHost, redisPort);
        await this.connectPubClient(redisHost, redisPort);
        await this.connectCacheClient(redisHost, redisPort);
    }

    startWebSocketServer(): void {
        this.wssServer = new WssServer();
        const wssServerConfig: WssServerConfig = {
            cert: fs.readFileSync(this.envVars.CCS3_OPERATOR_CONNECTOR_CERTIFICATE_CRT_FILE_PATH.value).toString(),
            key: fs.readFileSync(this.envVars.CCS3_OPERATOR_CONNECTOR_CERTIFICATE_KEY_FILE_PATH.value).toString(),
            caCert: fs.readFileSync(this.envVars.CCS3_OPERATOR_CONNECTOR_ISSUER_CERTIFICATE_CRT_FILE_PATH.value).toString(),
            port: this.envVars.CCS3_OPERATOR_CONNECTOR_PORT.value,
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
        this.logger.log('WebSocket server listening at port', this.envVars.CCS3_OPERATOR_CONNECTOR_PORT.value);
    }

    cleanUpClientConnections(): void {
        const connectionIdsWithCleanUpReason = new Map<number, ConnectionCleanUpReason>();
        const now = this.getNowAsNumber();
        for (const entry of this.connectedClients.entries()) {
            const connectionId = entry[0];
            const data = entry[1];
            // If not authenticated for a long time
            if (!data.isAuthenticated && (now - data.connectedAt) > this.state.authenticationTimeout) {
                connectionIdsWithCleanUpReason.set(connectionId, ConnectionCleanUpReason.authenticationTimeout);
            }
            // Add other conditions
            if (data.lastMessageReceivedAt) {
                if ((now - data.lastMessageReceivedAt) > this.state.idleTimeout) {
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
            this.logger.warn('Disconnecting client', connectionId, entry[1], clientData);
            if (clientData?.operatorId) {
                const note = JSON.stringify({
                    connectionId: entry[0],
                    connectionCleanUpReason: entry[1],
                    clientData: clientData,
                });
                this.publishOperatorConnectionEventMessage(clientData.operatorId, clientData.ipAddress, OperatorConnectionEventType.idleTimeout, note);
            }
            this.removeClient(connectionId);
            this.wssServer.closeConnection(connectionId);
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
            const staticFilesPathExists = fs.existsSync(resolvedStaticFilesPath);
            if (staticFilesPathExists) {
                this.logger.log('Serving static files from', resolvedStaticFilesPath);
            } else {
                this.logger.warn('Static files path', resolvedStaticFilesPath, 'does not exist');
            }
        }
    }

    async connectSubClient(redisHost: string, redisPort: number): Promise<void> {
        const subClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.logger.error('SubClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                this.logger.error('SubClient reconnect strategy error', retries, err);
                return 5000;
            },
        };
        const subClientMessageCallback: RedisClientMessageCallback = (channelName, message) => {
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
        await this.subClient.subscribe(ChannelName.operators);
        this.logger.log('SubClient subscribed to the channels');
    }

    async connectPubClient(redisHost: string, redisPort: number): Promise<void> {
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

    async terminate(): Promise<void> {
        this.logger.warn('Terminating');
        clearInterval(this.state.clientConnectionsMonitorTimerHandle);
        this.staticFilesServer?.stop();
        this.wssServer.stop();
        await this.subClient.disconnect();
        await this.pubClient.disconnect();
        await this.cacheClient.disconnect();
    }
}
