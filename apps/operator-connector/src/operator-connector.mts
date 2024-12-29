import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';

import { CreateConnectedRedisClientOptions, RedisCacheClient, RedisClientMessageCallback, RedisPubClient, RedisSubClient } from '@computerclubsystem/redis-client';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { MessageType } from '@computerclubsystem/types/messages/declarations/message-type.mjs';
import { BusDeviceStatusesMessage, DeviceStatus } from '@computerclubsystem/types/messages/bus/bus-device-statuses.message.mjs';
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
import { OperatorMessage } from '@computerclubsystem/types/messages/operators/declarations/operator.message.mjs';
import { OperatorMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { createOperatorConfigurationMessage, OperatorConfigurationMessage } from '@computerclubsystem/types/messages/operators/operator-configuration.message.mjs';
import { OperatorPingRequestMessage } from '@computerclubsystem/types/messages/operators/operator-ping-request.message.mjs';
import { CacheHelper, UserAuthDataCacheValue } from './cache-helper.mjs';
import { CanProcessOperatorMessageResult, CanProcessOperatorMessageResultErrorReason, ConnectedClientData, ConnectionCleanUpReason, IsTokenActiveResult, OperatorConnectorState } from './declarations.mjs';
import { OperatorRefreshTokenRequestMessage } from '@computerclubsystem/types/messages/operators/operator-refresh-token-request.message.mjs';
import { createOperatorRefreshTokenReplyMessage } from '@computerclubsystem/types/messages/operators/operator-refresh-token-reply.message.mjs';
import { createOperatorNotAuthenticatedMessage } from '@computerclubsystem/types/messages/operators/operator-not-authenticated.message.mjs';

export class OperatorConnector {
    private readonly subClient = new RedisSubClient();
    private readonly pubClient = new RedisPubClient();
    private readonly messageBusIdentifier = 'ccs3/operator-connector';
    private logger = new Logger();
    private staticFilesServer?: StaticFilesServer;
    private readonly envVars = new EnvironmentVariablesHelper().createEnvironmentVars();
    private readonly state = this.createState();
    private readonly cacheClient = new RedisCacheClient();
    private readonly cacheHelper = new CacheHelper();
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
            isAuthenticated: false,
            headers: args.headers,
        };
        this.setConnectedClientData(data);
        this.wssServer.attachToConnection(args.connectionId);
    }

    async processOperatorMessage(connectionId: number, message: OperatorMessage<any>): Promise<void> {
        const clientData = this.getConnectedClientData(connectionId);
        if (!clientData) {
            return;
        }

        const canProcessOperatorMessageResult = await this.canProcessOperatorMessage(clientData, message);
        if (!canProcessOperatorMessageResult.canProcess) {
            this.logger.log(`Can't process operator message`, canProcessOperatorMessageResult, message, clientData);
            if (canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenExpired
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenNotFound
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.tokenNotProvided
                || canProcessOperatorMessageResult.errorReason === CanProcessOperatorMessageResultErrorReason.messageRequiresAuthentication) {
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
            case OperatorMessageType.authRequest:
                this.processOperatorAuthRequestMessage(clientData, message as OperatorAuthRequestMessage);
                break;
            case OperatorMessageType.refreshTokenRequest:
                this.processOperatorRefreshTokenRequestMessage(clientData, message as OperatorRefreshTokenRequestMessage);
                break;
            case OperatorMessageType.pingRequest:
                this.processOperatorPingRequestMessage(clientData, message as OperatorPingRequestMessage);
                break;
        }
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
            this.sendMessageToOperator(refreshTokenReplyMsg, clientData);
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
        const operatorId = clientData.operatorId || authTokenCacheValue.userId;
        clientData.operatorId = operatorId;
        // Send messages back to the operator
        this.sendMessageToOperator(refreshTokenReplyMsg, clientData);
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
        const type = message.header.type;
        switch (type) {
            case MessageType.busOperatorAuthReply:
                this.processBusOperatorAuthReplyMessage(message as BusOperatorAuthReplyMessage)
                break;
            default:
                this.logger.log(`Unknown message received`, message);
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
        const type = message.header?.type;
        if (this.isWhiteSpace(type)) {
            result.canProcess = false;
            result.errorReason = CanProcessOperatorMessageResultErrorReason.messageTypeIsMissing;
            return result;
        }

        // Check if the message can be send anonymously
        const isAnonymousMessage = type === OperatorMessageType.authRequest;
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
        this.sendDeviceStatusesToOperators(message.body.deviceStatuses);
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

    sendDeviceStatusesToOperators(deviceStatuses: DeviceStatus[]): void {
        // Send device statuses message to all connected operators that can read this information
        // for (const status of deviceStatuses) {
        //     const connections = this.getConnectedClientsDataByDeviceId(status.deviceId);
        //     if (connections.length > 0) {
        //         for (const connection of connections) {
        //             const connectionId = connection[0];
        //             const msg = createDeviceSetStatusMessage();
        //             msg.body.state = status.state;
        //             msg.body.amounts = {
        //                 expectedEndAt: status.expectedEndAt,
        //                 remainingSeconds: status.remainingSeconds,
        //                 startedAt: status.startedAt,
        //                 totalSum: status.totalSum,
        //                 totalTime: status.totalTime,
        //             };
        //             try {
        //                 this.sendToDevice(msg, connectionId);
        //             } catch (err) {
        //                 this.logger.warn(`Can't send to device`, connectionId, msg, err);
        //             }
        //         }
        //     }
        // }
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

    publishToOperatorsChannel<TBody>(message: Message<TBody>): void {
        message.header.source = this.messageBusIdentifier;
        this.logger.log('Publishing message', ChannelName.operators, message.header.type, message);
        this.pubClient.publish(ChannelName.operators, JSON.stringify(message));
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

    sendMessageToOperator<TBody>(message: OperatorMessage<TBody>, clientData: ConnectedClientData): void {
        this.logger.log('Sending message to operator connection', clientData.connectionId, message.header.type, message);
        this.wssServer.sendJSON(message, clientData.connectionId);
    }

    startClientConnectionsMonitor(): void {
        setInterval(() => this.cleanUpClientConnections(), this.state.cleanUpClientConnectionsInterval);
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
        await this.joinMessageBus();
        this.startWebSocketServer();
        this.startClientConnectionsMonitor();
        this.serveStaticFiles();
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
            errorCallback: err => console.error('SubClient error', err),
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
            errorCallback: err => console.error('CacheClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                console.error('CacheClient reconnect strategy error', retries, err);
                return 5000;
            },
        };
        this.logger.log('CacheClient connecting');
        await this.cacheClient.connect(redisCacheClientOptions);
        this.logger.log('CacheClient connected');
    }
}
