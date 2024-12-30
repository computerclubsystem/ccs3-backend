import { randomUUID } from 'node:crypto';

import {
    RedisSubClient, RedisPubClient, RedisCacheClient, CreateConnectedRedisClientOptions,
    RedisClientMessageCallback
} from '@computerclubsystem/redis-client';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { Logger } from './logger.mjs';
import { BusDeviceGetByCertificateRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-certificate-request.message.mjs';
import { createBusDeviceGetByCertificateReplyMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-certificate-reply.message.mjs';
import { MessageType } from '@computerclubsystem/types/messages/declarations/message-type.mjs';
import { Device } from '@computerclubsystem/types/entities/device.mjs';
import { DeviceStatus, createBusDeviceStatusesMessage } from '@computerclubsystem/types/messages/bus/bus-device-statuses.message.mjs';
import { DeviceState } from '@computerclubsystem/types/entities/device-state.mjs';
import { envVars } from './env-vars.mjs';
import { StorageProviderConfig } from './storage/storage-provider-config.mjs';
import { StorageProvider } from './storage/storage-provider.mjs';
import { PostgreStorageProvider } from './postgre-storage/postgre-storage-provider.mjs';
import { BusDeviceUnknownDeviceConnectedRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-unknown-device-connected-request.message.mjs';
import { IDevice } from './storage/entities/device.mjs';
import { SystemSettingsName as SystemSettingName } from './storage/entities/constants/system-setting-names.mjs';
import { EntityConverter } from './entity-converter.mjs';
import { BusDeviceConnectionEventMessage } from '@computerclubsystem/types/messages/bus/bus-device-connection-event.message.mjs';
import { IDeviceConnectionEvent } from './storage/entities/device-connection-event.mjs';
import { BusOperatorAuthRequestMessage, BusOperatorAuthRequestMessageBody } from '@computerclubsystem/types/messages/bus/bus-operator-auth-request.message.mjs';
import { BusOperatorAuthReplyMessage, createBusOperatorAuthReplyMessage } from '@computerclubsystem/types/messages/bus/bus-operator-auth-reply.message.mjs';
import { transferSharedMessageDataToReplyMessage } from '@computerclubsystem/types/messages/utils.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { ISystemSetting } from './storage/entities/system-setting.mjs';
import { CacheHelper } from './cache-helper.mjs';
import { SystemSettingType } from './storage/entities/constants/system-setting-type.mjs';
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { BusOperatorConnectionEventMessage } from '@computerclubsystem/types/messages/bus/bus-operator-connection-event.message.mjs';
import { IOperatorConnectionEvent } from './storage/entities/operator-connection-event.mjs';
import { BusOperatorGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-get-all-devices-request.message.mjs';
import { createBusOperatorGetAllDevicesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-operator-get-all-devices-reply.message.mjs';

export class StateManager {
    private readonly className = (this as any).constructor.name;
    private readonly messageBusIdentifier = 'ccs3/state-manager';
    private readonly subClient = new RedisSubClient();
    private readonly pubClient = new RedisPubClient();
    private readonly cacheClient = new RedisCacheClient();
    private readonly cacheHelper = new CacheHelper();
    private readonly logger = new Logger();
    private storageProvider!: StorageProvider;
    private state = this.createDefaultState();
    private readonly entityConverter = new EntityConverter();
    private readonly envVars = new EnvironmentVariablesHelper().createEnvironmentVars();

    async start(): Promise<boolean> {
        this.cacheHelper.initialize(this.cacheClient);
        this.logger.setPrefix(this.className);
        const databaseInitialized = await this.initializeDatabase();
        if (!databaseInitialized) {
            this.logger.error('The database cannot be initialized');
            return false;
        }

        await this.loadSystemSettings();

        setInterval(() => this.mainTimerCallback(), 1000);

        const redisHost = this.envVars.CCS3_REDIS_HOST.value;
        const redisPort = this.envVars.CCS3_REDIS_PORT.value;
        this.logger.log('Using Redis host', redisHost, 'and port', redisPort);

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
                const messageJson = this.deserializeToMessage(message);
                if (messageJson) {
                    this.processReceivedBusMessage(channelName, messageJson);
                } else {
                    this.logger.warn('The message', message, 'deserialized to null');
                }
            } catch (err) {
                this.logger.warn('Cannot deserialize channel', channelName, 'message', message);
            }
        };
        await this.subClient.connect(subClientOptions, subClientMessageCallback);
        this.logger.log('SubClient connected');
        await this.subClient.subscribe(ChannelName.shared);
        await this.subClient.subscribe(ChannelName.devices);
        await this.subClient.subscribe(ChannelName.operators);

        const pubClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => this.logger.error('PubClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                this.logger.error('PubClient reconnect strategy error', retries, err);
                return 5000;
            },
        };
        this.logger.log('PubClient connecting');
        await this.pubClient.connect(pubClientOptions);
        this.logger.log('PubClient connected');

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

        // setInterval(async () => {
        //     try {
        //         console.log('StoreClient writing key/value pair');
        //         await storeClient.setValue('time', Date.now());
        //         const value = await storeClient.getValue('time');
        //         console.log('StoreClient read value', value);
        //     } catch (err) {
        //         console.log('Error while trying to write and read key/value pair', err);
        //     }
        // }, 1000);

        // // TODO: For testing only
        // this.startSendingDeviceSetStatusMessage();

        return true;
    }

    processReceivedBusMessage(channelName: string, message: Message<any>): void {
        if (this.isOwnMessage(message)) {
            return;
        }
        this.logger.log('Received channel', channelName, 'message', message.header.type, message);
        const type = message.header?.type;
        if (!type) {
            return;
        }

        switch (channelName) {
            case ChannelName.devices:
                this.processDevicesMessage(message);
                break;
            case ChannelName.operators:
                this.processOperatorsMessage(message);
                break;
            case ChannelName.shared:
                break;
        }
    }

    processOperatorsMessage<TBody>(message: Message<TBody>): void {
        const type = message.header?.type;
        switch (type) {
            case MessageType.busOperatorGetAllDevicesRequest:
                this.processOperatorGetAllDevicesRequest(message as BusOperatorGetAllDevicesRequestMessage);
                break;
            case MessageType.busOperatorAuthRequest:
                this.processOperatorAuthRequest(message as BusOperatorAuthRequestMessage);
                break;
            case MessageType.busOperatorConnectionEvent:
                this.processOperatorConnectionEvent(message as BusOperatorConnectionEventMessage);
                break;
        }
    }

    processDevicesMessage<TBody>(message: Message<TBody>): void {
        const type = message.header?.type;
        switch (type) {
            case MessageType.busDeviceGetByCertificateRequest:
                this.processDeviceGetByCertificateRequest(message as BusDeviceGetByCertificateRequestMessage);
                break;
            case MessageType.busDeviceUnknownDeviceConnectedRequest:
                this.processBusDeviceUnknownDeviceConnectedMessageRequest(message as BusDeviceUnknownDeviceConnectedRequestMessage);
                break;
            case MessageType.busDeviceConnectionEvent:
                this.processDeviceConnectionEventMessage(message as BusDeviceConnectionEventMessage);
                break;
        }
    }

    // async getBusOperatorAuthReplyMessageForToken(token: string): Promise<BusOperatorAuthReplyMessage> {
    //     const replyMsg = createBusOperatorAuthReplyMessage();
    //     const cachedItem: UserAuthDataCacheValue = await this.cacheHelper.getAuthTokenValue(token);
    //     if (cachedItem) {
    //         const now = this.getNowAsNumber();
    //         const isTokenExpired = now > cachedItem.tokenExpiresAt;
    //         if (!isTokenExpired) {
    //             // Token is not expired - get user data
    //             const user = await this.storageProvider.getUserById(cachedItem.userId);
    //             if (user) {
    //                 if (user.enabled) {
    //                     replyMsg.body.permissions = await this.storageProvider.getUserPermissions(user.id);
    //                     replyMsg.body.success = true;
    //                     replyMsg.body.userId = user.id;
    //                 } else {
    //                     // TODO: Set "User is not enabled"
    //                 }
    //             }
    //         }
    //     }
    //     return replyMsg;
    // }

    async getBusOperatorReplyMessageForUsernameAndPasswordHash(username: string, passwordHash: string): Promise<BusOperatorAuthReplyMessage> {
        const replyMsg = createBusOperatorAuthReplyMessage();
        const user = await this.storageProvider.getUser(username, passwordHash);
        if (!user) {
            // TODO: Send "credentials are invalid"
            replyMsg.body.success = false;
        } else if (!user.enabled) {
            // TODO: Send "User not enabled"
            const replyMsg = createBusOperatorAuthReplyMessage();
            replyMsg.body.success = false;
            replyMsg.body.userId = user.id;
        } else {
            // User with such username and password is found and is enabled
            const permissions = await this.storageProvider.getUserPermissions(user.id);
            replyMsg.body.success = true;
            replyMsg.body.userId = user.id;
            replyMsg.body.permissions = permissions;
        }
        return replyMsg;
    }

    async processOperatorGetAllDevicesRequest(message: BusOperatorGetAllDevicesRequestMessage): Promise<void> {
        const storageDevices = await this.storageProvider.getAllDevices();
        const replyMsg = createBusOperatorGetAllDevicesReplyMessage(message);
        replyMsg.body.devices = storageDevices.map(storageDevice => this.entityConverter.storageDeviceToDevice(storageDevice));
        this.publishToOperatorsChannel(replyMsg, message);
    }


    async processOperatorConnectionEvent(message: BusOperatorConnectionEventMessage): Promise<void> {
        try {
            const operatorConnectionEvent: IOperatorConnectionEvent = {
                operator_id: message.body.operatorId,
                ip_address: message.body.ipAddress,
                note: message.body.note,
                timestamp: this.getNowAsIsoString(),
                type: this.entityConverter.operatorConnectionEventTypeToOperatorConnectionEventStorage(message.body.type),
            } as IOperatorConnectionEvent;
            await this.storageProvider.addOperatorConnectionEvent(operatorConnectionEvent);
        } catch (err) {
            this.logger.warn(`Can't process BusOperatorConnectionEventMessage`, message, err);
        }
    }

    async processOperatorAuthRequest(message: BusOperatorAuthRequestMessage): Promise<void> {
        try {
            const body = message.body;
            // const rtData = message.header.roundTripData as OperatorConnectionRoundTripData;
            // if (body.token) {
            //     const replyMsg = await this.getBusOperatorAuthReplyMessageForToken(body.token);
            //     // if (replyMsg.body.success) {
            //     //     await this.maintainUserAuthDataTokenCacheItem(replyMsg.body.userId!, replyMsg.body.permissions!, replyMsg.body.token!, rtData)
            //     // }
            //     this.publishToOperatorsChannel(replyMsg, message);
            // } else {
            // If token is not provided - use username and passwords
            if (this.isWhiteSpace(body.username) || this.isWhiteSpace(body.passwordHash)) {
                this.logger.warn('Username or password not provided', message);
                return;
            }
            const replyMsg = await this.getBusOperatorReplyMessageForUsernameAndPasswordHash(body.username!, body.passwordHash!);
            // if (replyMsg.body.success) {
            //     await this.maintainUserAuthDataTokenCacheItem(replyMsg.body.userId!, replyMsg.body.permissions!, replyMsg.body.token!, rtData);
            // }
            this.publishToOperatorsChannel(replyMsg, message);
            // }
        } catch (err) {
            this.logger.warn(`Can't process BusOperatorAuthRequestMessage`, message, err);
        }
    }

    async processDeviceGetByCertificateRequest(message: BusDeviceGetByCertificateRequestMessage): Promise<void> {
        try {
            const device = await this.storageProvider.getDeviceByCertificateThumbprint(message.body.certificateThumbprint);
            const msg = createBusDeviceGetByCertificateReplyMessage();
            msg.header.correlationId = message.header.correlationId;
            msg.header.roundTripData = message.header.roundTripData;
            msg.body.device = device && this.entityConverter.storageDeviceToDevice(device);
            this.publishMessage(ChannelName.devices, msg);
        } catch (err) {
            this.logger.warn(`Can't process BusDeviceGetByCertificateRequestMessage message`, message, err);
        }
    }

    async processDeviceConnectionEventMessage(message: BusDeviceConnectionEventMessage): Promise<void> {
        try {
            const deviceConnectionEvent: IDeviceConnectionEvent = {
                device_id: message.body.deviceId,
                ip_address: message.body.ipAddress,
                note: message.body.note,
                timestamp: this.getNowAsIsoString(),
                type: this.entityConverter.deviceConnectionEventTypeToDeviceConnectionEventStorage(message.body.type),
            } as IDeviceConnectionEvent;
            await this.storageProvider.addDeviceConnectionEvent(deviceConnectionEvent);
        } catch (err) {
            this.logger.warn(`Can't process BusDeviceConnectionEventMessage message`, message, err);
        }
    }

    async processBusDeviceUnknownDeviceConnectedMessageRequest(message: BusDeviceUnknownDeviceConnectedRequestMessage): Promise<void> {
        try {
            // const connectionRoundtripData = message.header.roundTripData as ConnectionRoundTripData;
            const device: IDevice = {
                approved: false,
                certificate_thumbprint: message.body.certificateThumbprint,
                description: `Certificate: ${message.body.certificateSubject}`,
                name: message.body.certificateCommonName,
                ip_address: message.body.ipAddress,
                created_at: this.getNowAsIsoString(),
                enabled: false,
            } as IDevice;
            const createdDevice = await this.storageProvider.createDevice(device);
            this.logger.log('New device created. Device Id', createdDevice.id);
            // const msg = createBusDeviceGetByCertificateReplyMessage();
            // msg.header.correlationId = message.header.correlationId;
            // msg.header.roundTripData = message.header.roundTripData;
            // msg.body.device = device;
            // this.publishMessage(ChannelName.devices, msg);
        } catch (err) {
            this.logger.warn(`Can't process BusDeviceUnknownDeviceConnectedRequestMessage message`, message, err);
        }
    }

    serializeMessage<TBody>(message: Message<TBody>): string {
        return JSON.stringify(message);
    }

    deserializeToMessage(text: string): Message<any> | null {
        const json = JSON.parse(text);
        return json as Message<any>;
    }

    isOwnMessage<TBody>(message: Message<TBody>): boolean {
        return (message.header?.source === this.messageBusIdentifier);
    }

    async publishToOperatorsChannel<TBody>(message: Message<TBody>, sourceMessage?: Message<any>): Promise<number> {
        if (sourceMessage) {
            // Transfer source message common data (like round trip data) to destination message
            transferSharedMessageDataToReplyMessage(message, sourceMessage);
        }
        return this.publishMessage(ChannelName.operators, message);
    }

    async publishMessage<TBody>(channelName: ChannelName, message: Message<TBody>): Promise<number> {
        try {
            this.logger.log('Publishing message', channelName, message.header.type, message);
            message.header.source = this.messageBusIdentifier;
            return await this.pubClient.publish(channelName, this.serializeMessage(message));
        } catch (err) {
            this.logger.error('Cannot sent message to channel', channelName, message, err);
            return -1;
        }
    };

    private mainTimerCallback(): void {
        const now = this.getNowAsNumber();
        this.checkForRefreshDeviceStatuses(now);
    }

    private checkForRefreshDeviceStatuses(now: number): void {
        if (this.state.deviceStatusRefreshInProgress) {
            return;
        }
        const diff = now - this.state.lastDeviceStatusRefreshAt;
        if (diff > this.state.systemSettings[SystemSettingName.device_status_refresh_interval]) {
            this.state.lastDeviceStatusRefreshAt = now;
            this.refreshDeviceStatuses();
        }
    }

    private async refreshDeviceStatuses(): Promise<void> {
        try {
            this.state.deviceStatusRefreshInProgress = true;
            const deviceStatuses = await this.storageProvider.getAllDeviceStatuses();
            // TODO: Collect all the necessary information and generate message(s)
            //       with devices statuses for use by other services
        } catch (err) {
            // TODO: Count database errors and eventually send system notification
            this.logger.error(`Can't get all device statuses`, err);
        } finally {
            this.state.deviceStatusRefreshInProgress = false;
            this.state.lastDeviceStatusRefreshAt = this.getNowAsNumber();
        }
    }

    private isWhiteSpace(string?: string): boolean {
        return !(string?.trim());
    }

    private async initializeDatabase(): Promise<boolean> {
        const storageProviderConnectionString = this.envVars.CCS3_STATE_MANAGER_STORAGE_CONNECTION_STRING.value;
        if (!storageProviderConnectionString?.trim()) {
            this.logger.error('The environment variable', this.envVars.CCS3_STATE_MANAGER_STORAGE_CONNECTION_STRING.name, 'value is empty');
            return false;
        }
        this.storageProvider = this.getStorageProvider();
        const storageProviderConfig: StorageProviderConfig = {
            // adminConnectionString: undefined,
            connectionString: storageProviderConnectionString,
            databaseMigrationsPath: this.envVars.CCS3_STATE_MANAGER_STORAGE_PROVIDER_DATABASE_MIGRATION_SCRIPTS_DIRECTORY.value,
        };
        const initRes = await this.storageProvider.init(storageProviderConfig);
        return initRes.success;
    }

    private getStorageProvider(): StorageProvider {
        return new PostgreStorageProvider();
    }

    private getNowAsNumber(): number {
        return Date.now();
    }

    private getNowAsIsoString(): string {
        return new Date().toISOString();
    }

    private createDefaultState(): StateManagerState {
        const state: StateManagerState = {
            systemSettings: {
                device_status_refresh_interval: 10 * 1000,
                // 1800 seconds = 30 minutes
                token_duration: 1800 * 1000
            },
            lastDeviceStatusRefreshAt: this.getNowAsNumber(),
            deviceStatusRefreshInProgress: false,
        };
        return state;
    }

    private async loadSystemSettings(): Promise<void> {
        const allSystemSettings = await this.storageProvider.getAllSystemSettings();
        const settingsMap = new Map<string, ISystemSetting>();
        allSystemSettings.forEach(x => settingsMap.set(x.name, x));
        const getAsNumber = (name: SystemSettingName) => +settingsMap.get(name)?.value!;

        this.state.systemSettings[SystemSettingName.device_status_refresh_interval] = 1000 * getAsNumber(SystemSettingName.device_status_refresh_interval);
        this.state.systemSettings[SystemSettingName.token_duration] = 1000 * getAsNumber(SystemSettingName.token_duration);
    }

    createUUIDString(): string {
        return randomUUID().toString();
    }

    // // TODO: For testing only
    // private async addDummyDevices(): Promise<void> {
    //     await this.storeConnector.addDevice({
    //         deactivated: false,
    //         certificateThumbprint: '15a74d3f019108a339ffce6b5c9b6396619878dc',
    //         createdAt: new Date().toISOString(),
    //         id: '',
    //         name: 'comp-1',
    //     });
    //     await this.storeConnector.addDevice({
    //         deactivated: false,
    //         certificateThumbprint: '08:07:47:CB:CE:E6:D3:A4:79:21:31:5D:BF:7F:5A:C8:0D:77:4B:C5',
    //         createdAt: new Date().toISOString(),
    //         id: '',
    //         name: 'comp-2',
    //     });
    //     await this.storeConnector.addDevice({
    //         deactivated: false,
    //         certificateThumbprint: '22:06:A8:88:04:73:3F:69:51:04:42:A4:1F:65:91:A3:B2:4D:A0:28',
    //         createdAt: new Date().toISOString(),
    //         id: '',
    //         name: 'comp-3',
    //     });
    // }

    // // TODO: For testing only
    // private startSendingDeviceSetStatusMessage(): void {
    //     setInterval(() => {
    //         const msg = createBusDeviceStatusesMessage();
    //         msg.header.source = this.messageBusIdentifier;
    //         msg.body.deviceStatuses = [];
    //         const activeDevices = this.allDevices.filter(x => !x.deactivated);
    //         for (const device of activeDevices) {
    //             const deviceStatus: DeviceStatus = {
    //                 expectedEndAt: Math.round(Math.random() * 99999999),
    //                 startedAt: Math.round(Math.random() * 99999999),
    //                 state: Math.random() < 0.5 ? DeviceState.disabled : DeviceState.enabled,
    //                 totalSum: Math.random() * 99,
    //                 totalTime: Math.random() * 99999,
    //                 deviceId: device.id,
    //                 remainingSeconds: Math.round(Math.random() * 9999),
    //             };
    //             msg.body.deviceStatuses.push(deviceStatus);
    //         }
    //         this.publishMessage(ChannelName.devices, msg);
    //     }, 5000);
    // }
}

interface StateManagerState {
    systemSettings: StateManagerStateSystemSettings;
    lastDeviceStatusRefreshAt: number;
    deviceStatusRefreshInProgress: boolean;
}

interface StateManagerStateSystemSettings {
    [SystemSettingName.device_status_refresh_interval]: number;
    [SystemSettingName.token_duration]: number;
}

interface UserAuthDataCacheValue {
    userId: number;
    roundtripData: OperatorConnectionRoundTripData;
    permissions: string[];
    setAt: number;
    token: string;
    tokenExpiresAt: number;
}
