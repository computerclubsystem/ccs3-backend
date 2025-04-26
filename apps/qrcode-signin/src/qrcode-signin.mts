import { existsSync, readFileSync } from 'node:fs';
import * as https from 'node:https';
import { randomUUID } from 'node:crypto';
import express from 'express';
import { Request } from 'express-serve-static-core';

import { catchError, filter, finalize, first, firstValueFrom, Observable, throwError, timeout } from 'rxjs';

import { CreateConnectedRedisClientOptions, RedisClientMessageCallback, RedisPubClient, RedisSubClient } from '@computerclubsystem/redis-client';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { Logger } from './logger.mjs';
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { SubjectsService } from './subjects.service.mjs';
import { MessageStatItem } from './declarations.mjs';
import { BusCodeSignInWithCredentialsReplyMessageBody, createBusCodeSignInWithCredentialsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-code-sign-in-with-credentials.messages.mjs';
import { ApiCredentialsSignInRequestBody, ApiCredentialsSignInResponseBody, ApiCodeSignInIdentifierType, ApiTokenSignInRequestBody, ApiTokenSignInResponseBody } from './api-declarations.mjs';
import { BusCodeSignInWithLongLivedAccessTokenReplyMessageBody, createBusCodeSignInWithLongLivedAccessTokenRequestMessage } from '@computerclubsystem/types/messages/bus/bus-code-sign-in-with-long-lived-access-token.messages.mjs';
import { BusCodeSignInIdentifierType } from '@computerclubsystem/types/messages/bus/declarations/bus-code-sign-in-identifier-type.mjs';

export class QRCodeSignIn {
    private readonly subClient = new RedisSubClient();
    private readonly pubClient = new RedisPubClient();
    private readonly messageBusIdentifier = 'ccs3/qrcode-signin';
    private logger = new Logger();
    private readonly envVars = new EnvironmentVariablesHelper().createEnvironmentVars();
    private readonly state = this.createState();
    // private readonly validators = this.createValidators();
    // private readonly cacheClient = new RedisCacheClient();
    // private readonly cacheHelper = new CacheHelper();
    // private readonly authorizationHelper = new AuthorizationHelper();
    // private readonly errorReplyHelper = new ErrorReplyHelper();
    private readonly subjectsService = new SubjectsService();

    processBusMessageReceived(channelName: string, message: Message<unknown>): void {
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
                this.processSharedBusMessage(message);
                break;
        }
    }

    processSharedBusMessage<TBody>(message: Message<TBody>): void {
        this.subjectsService.setSharedChannelBusMessageReceived(message);
        // // Process shared channel notifications messages - all reply messages should be processed by the requester
        // const type = message.header.type;
        // switch (type) {
        //     case MessageType.busAllSystemSettingsNotification:
        //         this.processBusAllSystemSettingsNotificationMessage(message as BusAllSystemSettingsNotificationMessage);
        //         break;
        // }
    }

    processDevicesBusMessage<TBody>(message: Message<TBody>): void {
        this.subjectsService.setDevicesChannelBusMessageReceived(message);
        // const type = message.header.type;
        // switch (type) {
        //     case MessageType.busDeviceConnectivitiesNotification:
        //         this.processBusDeviceConnectivitiesNotificationMessage(message as BusDeviceConnectivitiesNotificationMessage);
        //         break;
        //     case MessageType.busDeviceStatusesNotification:
        //         this.processBusDeviceStatusesNotificationMessage(message as BusDeviceStatusesNotificationMessage);
        //         break;
        // }
    }

    processOperatorsBusMessage<TBody>(message: Message<TBody>): void {
        this.subjectsService.setOperatorsChannelBusMessageReceived(message);
        // TODO: Process operators channel notifications messages - all reply messages should be processed by the requester
        // const type = message.header.type;
        // switch (type) {
        // }
    }

    async start(): Promise<void> {
        // this.cacheHelper.initialize(this.cacheClient);
        // this.subscribeToSubjects();
        await this.joinMessageBus();
        // this.requestAllSystemSettings();
        // this.startWebSocketServer();
        // this.startMainTimer();
        // this.startClientConnectionsMonitor();
        this.startWebAPI();
    }

    startWebAPI(): void {
        const app = express();
        app.use(express.json());

        app.post('/api/credentials-sign-in', async (req, res) => {
            const result = await this.processApiCredentialsSignIn(req.body as ApiCredentialsSignInRequestBody, this.getIpAddressFromRequest(req));
            res.json(result);
        });

        app.post('/api/token-sign-in', async (req, res) => {
            const result = await this.processApiTokenSignIn(req.body as ApiTokenSignInRequestBody, this.getIpAddressFromRequest(req));
            res.json(result);
        });

        const noStaticFilesServing = this.envVars.CCS3_QRCODE_SIGNIN_NO_STATIC_FILES_SERVING.value;
        if (!noStaticFilesServing) {
            const staticFilesPath = this.envVars.CCS3_QRCODE_SIGNIN_STATIC_FILES_PATH.value!;
            const staticFilesPathExists = existsSync(staticFilesPath);
            if (staticFilesPathExists) {
                this.logger.log(`Serving static files from ${staticFilesPath}`);
            } else {
                this.logger.warn(`Static files path ${staticFilesPath} does not exist`);
            }
            // TODO: The static files server must return "cache-control" response header. Supporting caching is desirable
            app.use(express.static(staticFilesPath, { etag: true }));
        }

        const webAPIPort = this.envVars.CCS3_QRCODE_SIGNIN_PORT.value;
        const httpsServer = https.createServer({
            cert: readFileSync(this.envVars.CCS3_QRCODE_SIGNIN_CERTIFICATE_CRT_FILE_PATH.value).toString(),
            key: readFileSync(this.envVars.CCS3_QRCODE_SIGNIN_CERTIFICATE_KEY_FILE_PATH.value).toString(),
            ca: readFileSync(this.envVars.CCS3_QRCODE_SIGNIN_ISSUER_CERTIFICATE_CRT_FILE_PATH.value).toString(),
        }, app);
        httpsServer.listen(webAPIPort, () => {
            this.logger.log(`Listening at port ${webAPIPort}`);
        });
    }

    async processApiTokenSignIn(reqBody: ApiTokenSignInRequestBody, ipAddress?: string | null): Promise<ApiTokenSignInResponseBody> {
        const result: ApiTokenSignInResponseBody = {
            success: false,
        };
        const busRequestMsg = createBusCodeSignInWithLongLivedAccessTokenRequestMessage();
        busRequestMsg.body.code = reqBody.code;
        busRequestMsg.body.token = reqBody.token;
        busRequestMsg.body.ipAddress = ipAddress;
        busRequestMsg.body.identifierType = this.apiSignInIdentifierTypeToBusCodeSignInIdentifierTo(reqBody.identifierType)!;
        try {
            const res = await this.publishToSharedChannelAsync<BusCodeSignInWithLongLivedAccessTokenReplyMessageBody>(busRequestMsg);
            if (res.header.failure || !res.body.success) {
                result.success = false;
                const errCode = res.body.errorCode || res.header.errors?.[0].code || '';
                const errMessage = res.body.errorMessage || res.header.errors?.[0].description || '';
                result.errorMessage = `Error: ${errMessage} (${errCode})`;
            } else {
                result.success = res.body.success;
                result.errorMessage = res.body.errorMessage;
                result.remainingSeconds = res.body.remainingSeconds;
                result.identifier = res.body.identifier;
                result.identifierType = this.busCodeSignInIdentifierToApiSignInIdentifierType(res.body.identifierType);
            }
        } catch (err) {
            this.logger.error('Error in processApiTokenSignIn', err);
            result.success = false;
            result.errorMessage = `Can't sign in`;
        }
        return result;
    }

    async processApiCredentialsSignIn(reqBody: ApiCredentialsSignInRequestBody, ipAddress?: string | null): Promise<ApiCredentialsSignInResponseBody> {
        const result: ApiCredentialsSignInResponseBody = {
            success: false,
        };
        const busRequestMsg = createBusCodeSignInWithCredentialsRequestMessage();
        busRequestMsg.body.identifier = reqBody.identifier;
        busRequestMsg.body.passwordHash = reqBody.passwordHash;
        busRequestMsg.body.code = reqBody.code;
        busRequestMsg.body.ipAddress = ipAddress;
        busRequestMsg.body.identifierType = this.apiSignInIdentifierTypeToBusCodeSignInIdentifierTo(reqBody.identifierType)!;
        try {
            const res = await this.publishToSharedChannelAsync<BusCodeSignInWithCredentialsReplyMessageBody>(busRequestMsg);
            if (res.header.failure) {
                result.success = false;
                result.errorMessage = `Error: ${res.header.errors?.[0].description || ''} (${res.header.errors?.[0].code || ''})`;
            } else {
                result.success = res.body.success;
                result.errorMessage = res.body.errorMessage;
                result.remainingSeconds = res.body.remainingSeconds;
                result.token = res.body.token;
                result.identifier = res.body.identifier;
                result.identifierType = this.busCodeSignInIdentifierToApiSignInIdentifierType(res.body.identifierType);
            }
        } catch (err) {
            this.logger.error('Error in processApiCredentialsSignIn', err);
            result.success = false;
            result.errorMessage = `Can't sign in. ${(err as Error).message}`;
        }
        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async publishToSharedChannelAsync<TReplyBody>(busMessage: Message<any>): Promise<Message<TReplyBody>> {
        const result = await firstValueFrom(this.publishToSharedChannelAndWaitForReply<TReplyBody>(busMessage));
        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishToSharedChannelAndWaitForReply<TReplyBody>(busMessage: Message<any>): Observable<Message<TReplyBody>> {
        const messageStatItem: MessageStatItem = {
            sentAt: this.getNowAsNumber(),
            channel: ChannelName.shared,
            correlationId: busMessage.header.correlationId,
            type: busMessage.header.type,
            completedAt: 0,
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
                // TODO: of() will complete the observable. The subscriber will not know about the error/timeout
                // return of();
                return throwError(() => err);
            }),
            finalize(() => {
                messageStatItem.completedAt = this.getNowAsNumber();
                this.subjectsService.setMessageStat(messageStatItem);
            }),
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishToSharedChannel<TBody>(message: Message<TBody>): Observable<Message<any>> {
        message.header.source = this.messageBusIdentifier;
        this.logger.log('Publishing message', ChannelName.shared, message.header.type, message);
        this.pubClient.publish(ChannelName.shared, JSON.stringify(message));
        return this.subjectsService.getSharedChannelBusMessageReceived();
    }

    busCodeSignInIdentifierToApiSignInIdentifierType(busIdentifierType: BusCodeSignInIdentifierType | undefined | null): ApiCodeSignInIdentifierType | undefined | null {
        if (!busIdentifierType) {
            return busIdentifierType;
        }
        const map = new Map<BusCodeSignInIdentifierType, ApiCodeSignInIdentifierType>();
        map.set(BusCodeSignInIdentifierType.customerCard, ApiCodeSignInIdentifierType.customerCard);
        map.set(BusCodeSignInIdentifierType.user, ApiCodeSignInIdentifierType.user);
        return map.get(busIdentifierType) || busIdentifierType as unknown as ApiCodeSignInIdentifierType;
    }

    apiSignInIdentifierTypeToBusCodeSignInIdentifierTo(apiIdentifierType: ApiCodeSignInIdentifierType | undefined | null): BusCodeSignInIdentifierType | undefined | null {
        if (!apiIdentifierType) {
            return apiIdentifierType;
        }
        const map = new Map<ApiCodeSignInIdentifierType, BusCodeSignInIdentifierType>();
        map.set(ApiCodeSignInIdentifierType.customerCard, BusCodeSignInIdentifierType.customerCard);
        map.set(ApiCodeSignInIdentifierType.user, BusCodeSignInIdentifierType.user);
        return map.get(apiIdentifierType) || apiIdentifierType as unknown as BusCodeSignInIdentifierType;
    }

    getIpAddressFromRequest(req: Request<unknown, unknown, unknown, unknown>): string {
        // TODO: Check if we have proxy that will send the client IP address in header like X-Forwarded-For (req.ip might already do this)
        return req.ip || req.socket.remoteAddress || '';
    }

    getNowAsNumber(): number {
        return Date.now();
    }

    createUUIDString(): string {
        return randomUUID().toString();
    }

    async joinMessageBus(): Promise<void> {
        const redisHost = this.envVars.CCS3_REDIS_HOST.value;
        const redisPort = this.envVars.CCS3_REDIS_PORT.value;
        this.logger.log(`Using redis host ${redisHost} and port ${redisPort}`);

        await this.connectPubClient(redisHost, redisPort);
        await this.connectSubClient(redisHost, redisPort);
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

    deserializeBusMessageToMessage(text: string): Message<unknown> | null {
        const json = JSON.parse(text);
        return json as Message<unknown>;
    }

    isOwnMessage<TBody>(message: Message<TBody>): boolean {
        return (message.header.source === this.messageBusIdentifier);
    }

    createState(): QRCodeSignInState {
        const state: QRCodeSignInState = {
            // Give more time because multiple bus messages could be involved to complete the requests
            messageBusReplyTimeout: 10000,
            pubClientPublishErrorsCount: 0,
            maxAllowedPubClientPublishErrorsCount: 100,
        };
        return state;
    }

    async terminate(): Promise<void> {
        this.logger.warn('Terminating');
        // clearInterval(this.state.clientConnectionsMonitorTimerHandle);
        // clearInterval(this.state.mainTimerHandle);
        // this.staticFilesServer?.stop();
        // this.wssServer.stop();
        // await this.subClient.disconnect();
        // await this.pubClient.disconnect();
        // await this.cacheClient.disconnect();
    }
}

interface QRCodeSignInState {
    messageBusReplyTimeout: number;
    pubClientPublishErrorsCount: number;
    maxAllowedPubClientPublishErrorsCount: number;
}