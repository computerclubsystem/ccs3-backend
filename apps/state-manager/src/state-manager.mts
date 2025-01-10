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
// import { DeviceState } from '@computerclubsystem/types/entities/device-state.mjs';
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
import { transferSharedMessageData } from '@computerclubsystem/types/messages/utils.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { ISystemSetting } from './storage/entities/system-setting.mjs';
import { CacheHelper } from './cache-helper.mjs';
import { SystemSettingType } from './storage/entities/constants/system-setting-type.mjs';
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { BusOperatorConnectionEventMessage } from '@computerclubsystem/types/messages/bus/bus-operator-connection-event.message.mjs';
import { IOperatorConnectionEvent } from './storage/entities/operator-connection-event.mjs';
import { BusOperatorGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-get-all-devices-request.message.mjs';
import { createBusOperatorGetAllDevicesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-operator-get-all-devices-reply.message.mjs';
import { BusDeviceGetByIdRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id-request.message.mjs';
import { createBusDeviceGetByIdReplyMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id-reply.message.mjs';
import { BusUpdateDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-request.message.mjs';
import { createBusUpdateDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-reply.message.mjs';
import { IDeviceStatus } from './storage/entities/device-status.mjs';
import { BusGetAllTariffsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-tariffs-request.message.mjs';
import { createBusGetAllTariffsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-tariffs-reply.message.mjs';
import { BusCreateTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-tariff-request.message.mjs';
import { createBusCreateTariffReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-tariff-reply.message.mjs';
import { Tariff, TariffType } from '@computerclubsystem/types/entities/tariff.mjs';
import { BusStartDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-start-device-request.message.mjs';
import { createBusStartDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-start-device-reply.message.mjs';
import { TariffHelper } from './tariff-helper.mjs';
import { BusErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-error-code.mjs';
import { DateTimeHelper } from './date-time-helper.mjs';
import { BusGetTariffByIdRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-tariff-by-id-request.message.mjs';
import { createBusGetTariffByIdReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-tariff-by-id-reply.message.mjs';
import { BusUpdateTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-tariff-request.message.mjs';
import { createBusUpdateTariffReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-tariff-reply.message.mjs';
import { ITariff } from './storage/entities/tariff.mjs';

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
    private readonly tariffHelper = new TariffHelper();
    private readonly dateTimeHelper = new DateTimeHelper();
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

        this.dateTimeHelper.setDefaultTimeZone(this.state.systemSettings[SystemSettingName.timezone]);
        // TODO: Should we publish system settings to the shared channel ? They can contain sensitive information

        this.state.mainTimerHandle = setInterval(() => this.mainTimerCallback(), 1000);

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
            case MessageType.busStartDeviceRequest:
                this.processStartDeviceRequestMessage(message as BusStartDeviceRequestMessage);
                break;
            case MessageType.busGetTariffByIdRequest:
                this.processGetTariffByIdRequestMessage(message as BusGetTariffByIdRequestMessage);
                break;
            case MessageType.busCreateTariffRequest:
                this.processCreateTariffRequestMessage(message as BusCreateTariffRequestMessage);
                break;
            case MessageType.busUpdateTariffRequest:
                this.processUpdateTariffRequestMessage(message as BusUpdateTariffRequestMessage);
                break;
            case MessageType.busGetAllTariffsRequest:
                this.processGetAllTariffsRequestMessage(message as BusGetAllTariffsRequestMessage);
                break;
            case MessageType.busUpdateDeviceRequest:
                this.processUpdateDeviceRequest(message as BusUpdateDeviceRequestMessage);
                break;
            case MessageType.busOperatorGetDeviceByIdRequest:
                this.processOperatorGetDeviceByIdRequest(message as BusDeviceGetByIdRequestMessage);
                break;
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

    async processStartDeviceRequestMessage(message: BusStartDeviceRequestMessage): Promise<void> {
        try {
            if (!message.body.userId) {
                const replyMsg = createBusStartDeviceReplyMessage();
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.userIdIsRequired, description: 'User Id is required to start device' },
                ]
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const currentStorageDeviceStatus = (await this.storageProvider.getDeviceStatus(message.body.deviceId))!;
            if (currentStorageDeviceStatus.started) {
                // Already started
                const replyMsg = createBusStartDeviceReplyMessage();
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.deviceAlreadyStarted, description: 'Selected device is already started' },
                ]
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const allTariffs = await this.getAndCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === message.body.tariffId)!;
            // const canUseTariffResult = this.tariffHelper.canUseTariff(tariff);
            // if (!canUseTariffResult.canUse) {
            //     // Already started
            //     const replyMsg = createBusStartDeviceReplyMessage();
            //     replyMsg.header.failure = true;
            //     replyMsg.header.errors = [
            //         { code: BusErrorCode.cantUseTheTariffNow, description: `Can't use the tariff right now` },
            //     ]
            //     this.publishToOperatorsChannel(replyMsg, message);
            //     return;
            // }
            if (tariff.type === TariffType.fromTo) {
                const isCurrentMinuteInPeriodResult = this.dateTimeHelper.isCurrentMinuteInMinutePeriod(tariff.fromTime!, tariff.toTime!);
                this.logger.log('isCurrentMinuteInMinutePeriod: Tariff id', tariff.id, 'fromTime', tariff.fromTime, 'toTime', tariff.toTime, 'result', isCurrentMinuteInPeriodResult);
                if (!isCurrentMinuteInPeriodResult.isInPeriod) {
                    const replyMsg = createBusStartDeviceReplyMessage();
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [
                        { code: BusErrorCode.cantUseTheTariffNow, description: `Can't use the tariff right now` },
                    ]
                    this.publishToOperatorsChannel(replyMsg, message);
                    return;
                }
            }

            if (tariff.type === TariffType.duration) {
                if (tariff.restrictStartTime) {
                    const isCurrentMinuteInPeriodResult = this.dateTimeHelper.isCurrentMinuteInMinutePeriod(tariff.restrictStartFromTime!, tariff.restrictStartToTime!);
                    if (!isCurrentMinuteInPeriodResult.isInPeriod) {
                        const replyMsg = createBusStartDeviceReplyMessage();
                        replyMsg.header.failure = true;
                        replyMsg.header.errors = [
                            { code: BusErrorCode.cantStartTheTariffNow, description: `Can't start the tariff right now` },
                        ]
                        this.publishToOperatorsChannel(replyMsg, message);
                        return;
                    }
                }
            }

            currentStorageDeviceStatus.enabled = true;
            currentStorageDeviceStatus.start_reason = message.body.tariffId;
            currentStorageDeviceStatus.started = true;
            currentStorageDeviceStatus.started_at = this.getNowAsIsoString();
            currentStorageDeviceStatus.stopped_at = null;
            currentStorageDeviceStatus.total = tariff.price;
            currentStorageDeviceStatus.started_by_user_id = message.body.userId;
            await this.storageProvider.updateDeviceStatus(currentStorageDeviceStatus);
            const replyMsg = createBusStartDeviceReplyMessage();
            replyMsg.body.deviceStatus = this.createAndCalculateDeviceStatusFromStorageDeviceStatus(currentStorageDeviceStatus, tariff);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusStartDeviceRequestMessage message`, message, err);
            const replyMsg = createBusStartDeviceReplyMessage(message);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processUpdateTariffRequestMessage(message: BusUpdateTariffRequestMessage): Promise<void> {
        try {
            const replyMsg = createBusUpdateTariffReplyMessage();
            const tariff: Tariff = message.body.tariff;
            // TODO: Validate the tariff
            if (!tariff?.id) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.cantFindTariff,
                    description: `Can't find tariff`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const storageTariff = this.entityConverter.tariffToStorageTariff(tariff);
            storageTariff.updated_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const updatedTariff = await this.storageProvider.updateTariff(storageTariff);
            if (!updatedTariff) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.cantFindTariff,
                    description: `Can't find tariff`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            replyMsg.body.tariff = this.entityConverter.storageTariffToTariff(updatedTariff);
            // Refresh the tariffs
            await this.cacheAllTariffs();
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusUpdateTariffRequestMessage message`, message, err);
            const replyMsg = createBusUpdateTariffReplyMessage();
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processGetTariffByIdRequestMessage(message: BusGetTariffByIdRequestMessage): Promise<void> {
        try {
            const replyMsg = createBusGetTariffByIdReplyMessage();
            const allTariffs = await this.getAndCacheAllTariffs();
            const cachedTariff = allTariffs?.find(x => x.id === message.body.tariffId);
            if (cachedTariff) {
                replyMsg.body.tariff = cachedTariff;
            } else {
                const storageTariff = await this.storageProvider.getTariffById(message.body.tariffId);
                if (storageTariff) {
                    replyMsg.body.tariff = this.entityConverter.storageTariffToTariff(storageTariff);
                } else {
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.cantFindTariff,
                        description: `Can't find tariff with Id '${message.body.tariffId}'`,
                    }];
                }
            }
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetTariffByIdRequestMessage message`, message, err);
            const replyMsg = createBusGetTariffByIdReplyMessage(message);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processCreateTariffRequestMessage(message: BusCreateTariffRequestMessage): Promise<void> {
        try {
            // TODO: Validate the tariff
            const storageTariff = this.entityConverter.tariffToStorageTariff(message.body.tariff);
            storageTariff.created_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const tariff = await this.storageProvider.createTariff(storageTariff);
            await this.cacheAllTariffs();
            const replyMsg = createBusCreateTariffReplyMessage(message);
            replyMsg.body.tariff = tariff;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusCreateTariffRequestMessage message`, message, err);
            const replyMsg = createBusCreateTariffReplyMessage(message);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processGetAllTariffsRequestMessage(message: BusGetAllTariffsRequestMessage): Promise<void> {
        try {
            const allTariffs = await this.storageProvider.getAllTariffs();
            const replyMsg = createBusGetAllTariffsReplyMessage(message);
            replyMsg.body.tariffs = allTariffs.map(tariff => this.entityConverter.storageTariffToTariff(tariff));
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetAllTariffsRequestMessage message`, message, err);
            const replyMsg = createBusGetAllTariffsReplyMessage(message);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processUpdateDeviceRequest(message: BusUpdateDeviceRequestMessage): Promise<void> {
        try {
            if (!message.body.device?.id) {
                this.logger.warn(`Can't update device without id`, message);
                const replyMsg = createBusUpdateDeviceReplyMessage(message);
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: '',
                    description: 'Specified device does not have id',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const storageDevice = this.entityConverter.deviceToStorageDevice(message.body.device);
            const updatedStorageDevice = await this.storageProvider.updateDevice(storageDevice);
            await this.cacheAllDevices();
            const deviceStatusEnabled = updatedStorageDevice.approved && updatedStorageDevice.enabled;
            // Create record in device_status table - if it already exists, it will not be changed
            const deviceStatus: IDeviceStatus = {
                device_id: message.body.device.id,
                start_reason: null,
                started: false,
                started_at: null,
                stopped_at: null,
                total: null,
                enabled: deviceStatusEnabled,
            };
            await this.storageProvider.addOrUpdateDeviceStatusEnabled(deviceStatus);
            const replyMsg = createBusUpdateDeviceReplyMessage(message);
            replyMsg.body.device = updatedStorageDevice && this.entityConverter.storageDeviceToDevice(updatedStorageDevice);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusUpdateDeviceRequestMessage message`, message, err);
            const replyMsg = createBusUpdateDeviceReplyMessage(message);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processOperatorGetDeviceByIdRequest(message: BusDeviceGetByIdRequestMessage): Promise<void> {
        try {
            const device = await this.storageProvider.getDeviceById(message.body.deviceId);
            const replyMsg = createBusDeviceGetByIdReplyMessage(message);
            replyMsg.body.device = device && this.entityConverter.storageDeviceToDevice(device);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusDeviceGetByIdRequestMessage message`, message, err);
        }
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
            const storageDeviceStatus: IDeviceStatus = {
                device_id: createdDevice.id,
                enabled: false,
                start_reason: null,
                started: false,
                started_at: null,
                stopped_at: null,
                total: null,
            }
            // Create record in device statuses database table
            await this.storageProvider.addOrUpdateDeviceStatusEnabled(storageDeviceStatus);
            this.logger.log('New device created. Device Id', createdDevice.id);
            await this.cacheAllDevices();
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
            transferSharedMessageData(message, sourceMessage);
        }
        return this.publishMessage(ChannelName.operators, message);
    }

    async publishToDevicesChannel<TBody>(message: Message<TBody>, sourceMessage?: Message<any>): Promise<number> {
        if (sourceMessage) {
            // Transfer source message common data (like round trip data) to destination message
            transferSharedMessageData(message, sourceMessage);
        }
        return this.publishMessage(ChannelName.devices, message);
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
        const now = this.dateTimeHelper.getCurrentDateTimeAsNumber();
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

    private async cacheAllTariffs(): Promise<Tariff[]> {
        const storageTariffs = await this.storageProvider.getAllTariffs();
        const allTariffs = storageTariffs.map(x => this.entityConverter.storageTariffToTariff(x));
        await this.cacheHelper.setAllTariffs(allTariffs);
        return allTariffs;
    }

    private async getAndCacheAllTariffs(): Promise<Tariff[]> {
        let allTariffs = await this.cacheHelper.getAllTariffs();
        if (!allTariffs) {
            allTariffs = await this.cacheAllTariffs();
        }
        return allTariffs;
    }

    private async cacheAllDevices(): Promise<Device[]> {
        const storageDevices = await this.storageProvider.getAllDevices();
        const allDevices = storageDevices.map(x => this.entityConverter.storageDeviceToDevice(x));
        await this.cacheHelper.setAllDevices(allDevices);
        return allDevices;
    }

    private async getAndCacheAllDevices(): Promise<Device[]> {
        let allDevices = await this.cacheHelper.getAllDevices();
        if (!allDevices) {
            allDevices = await this.cacheAllDevices();
        }
        return allDevices;
    }

    private async refreshDeviceStatuses(): Promise<void> {
        try {
            this.state.deviceStatusRefreshInProgress = true;
            const storageDeviceStatuses = await this.storageProvider.getAllDeviceStatuses();
            const allTariffs = await this.getAndCacheAllTariffs();
            let allDevices = await this.getAndCacheAllDevices();
            // TODO: We will process only enabled devices
            //       If the user disables device while it is started (the system should prevent this),
            //       it will not be processed here and will remain started until enabled again
            const enabledDevices = allDevices.filter(x => x.approved && x.enabled);
            const deviceStatuses: DeviceStatus[] = [];
            for (const enabledDevice of enabledDevices) {
                const storageDeviceStatus = storageDeviceStatuses.find(x => x.device_id === enabledDevice.id);
                if (storageDeviceStatus) {
                    const tariff = allTariffs.find(x => x.id === storageDeviceStatus.start_reason)!;
                    const calculatedDeviceStatus = this.createAndCalculateDeviceStatusFromStorageDeviceStatus(storageDeviceStatus, tariff);
                    if (storageDeviceStatus.started && !calculatedDeviceStatus.started) {
                        // After the calculation, if device was started but no longer, it must be stopped
                        // TODO: See if we need to switch to another tariff
                        storageDeviceStatus.started = calculatedDeviceStatus.started;
                        storageDeviceStatus.stopped_at = this.getStringDateFromNumber(calculatedDeviceStatus.stoppedAt!);
                        storageDeviceStatus.total = calculatedDeviceStatus.totalSum;
                        await this.storageProvider.updateDeviceStatus(storageDeviceStatus);
                        // TODO: Save the stop to device_status_history
                    }
                    deviceStatuses.push(calculatedDeviceStatus);
                } else {
                    // Device status for this device is not found - consider it in the default status
                    deviceStatuses.push({
                        deviceId: enabledDevice.id,
                        enabled: true,
                        expectedEndAt: null,
                        remainingSeconds: null,
                        started: false,
                        startedAt: null,
                        stoppedAt: null,
                        totalSum: null,
                        totalTime: null,
                    });
                }
            }
            // Send device statuses to the channel
            const deviceStatusMsg = createBusDeviceStatusesMessage();
            deviceStatusMsg.body.deviceStatuses = deviceStatuses;
            this.publishToDevicesChannel(deviceStatusMsg);
        } catch (err) {
            // TODO: Count database errors and eventually send system notification
            this.logger.error(`Can't get all device statuses`, err);
        } finally {
            this.state.deviceStatusRefreshInProgress = false;
            this.state.lastDeviceStatusRefreshAt = this.dateTimeHelper.getCurrentDateTimeAsNumber();
        }
    }

    createAndCalculateDeviceStatusFromStorageDeviceStatus(storageDeviceStatus: IDeviceStatus, tariff: Tariff): DeviceStatus {
        const calculatedDeviceStatus = this.createDeviceStatusFromStorageDeviceStatus(storageDeviceStatus);
        if (!calculatedDeviceStatus.started) {
            // If the device is not started - it was already calculated - just return it without modifications
            return calculatedDeviceStatus;
        }
        // The device is started - calculate the elapsed time, remaining time and the total sum
        switch (tariff.type) {
            case TariffType.duration:
                this.modifyDeviceStatusForDurationTariff(calculatedDeviceStatus, tariff);
                break;
            case TariffType.fromTo:
                this.modifyDeviceStatusForFromToTariff(calculatedDeviceStatus, tariff);
                break;
        }
        return calculatedDeviceStatus;
    }

    createDeviceStatusFromStorageDeviceStatus(storageDeviceStatus: IDeviceStatus): DeviceStatus {
        const deviceStatus: DeviceStatus = {
            deviceId: storageDeviceStatus.device_id,
            enabled: storageDeviceStatus.enabled,
            started: storageDeviceStatus.started,
            expectedEndAt: null,
            remainingSeconds: null,
            startedAt: this.getNumberFromDate(storageDeviceStatus.started_at),
            stoppedAt: this.getNumberFromDate(storageDeviceStatus.stopped_at),
            totalSum: storageDeviceStatus.total,
            totalTime: null,
            tariff: storageDeviceStatus.start_reason,
            startedByUserId: storageDeviceStatus.started_by_user_id,
        } as DeviceStatus;
        return deviceStatus;
    }

    modifyDeviceStatusForDurationTariff(deviceStatus: DeviceStatus, tariff: Tariff): void {
        if (!deviceStatus.started) {
            // Stopped devices should have been modified when stopped
            return;
        }
        const now = this.dateTimeHelper.getCurrentDateTimeAsNumber();
        const startedAt = deviceStatus.startedAt!;
        const diffMs = now - startedAt;
        const tariffDurationMs = tariff.duration! * 60 * 1000;
        // totalTime must be in seconds
        deviceStatus.totalTime = Math.ceil(diffMs / 1000);
        deviceStatus.totalSum = tariff.price;
        if (diffMs >= tariffDurationMs) {
            // Must be stopped
            deviceStatus.started = false;
            deviceStatus.expectedEndAt = now;
            deviceStatus.stoppedAt = now;
            deviceStatus.remainingSeconds = 0;
        } else {
            // Still in the tariff duration
            deviceStatus.expectedEndAt = startedAt + tariffDurationMs;
            const remainingMs = deviceStatus.expectedEndAt - now;
            const remainingSeconds = Math.floor(remainingMs / 1000);
            deviceStatus.remainingSeconds = remainingSeconds;
        }
    }

    modifyDeviceStatusForFromToTariff(deviceStatus: DeviceStatus, tariff: Tariff): void {
        if (!deviceStatus.started) {
            // Stopped devices should have been modified when stopped
            return;
        }
        const now = this.dateTimeHelper.getCurrentDateTimeAsNumber();
        deviceStatus.totalSum = tariff.price;
        const tariffFromMinute = tariff.fromTime!;
        const tariffToMinute = tariff.toTime!;
        const startedAt = deviceStatus.startedAt!;

        // Check if current date has passed the "To" minute of the tariff
        const compareCurrentDateWithMinutePeriodResult = this.dateTimeHelper.compareCurrentDateWithMinutePeriod(startedAt, tariffFromMinute, tariffToMinute);
        if (compareCurrentDateWithMinutePeriodResult.isAfter) {
            // Must be stopped
            deviceStatus.started = false;
            deviceStatus.expectedEndAt = now;
            deviceStatus.stoppedAt = now;
            deviceStatus.remainingSeconds = 0;
        } else {
            // Still in the tariff period
            // deviceStatus.expectedEndAt = startedAt + tariffDurationMs;
            // const remainingMs = deviceStatus.expectedEndAt - now;
            // const remainingSeconds = Math.floor(remainingMs / 1000);
            deviceStatus.remainingSeconds = compareCurrentDateWithMinutePeriodResult.remainingSeconds!;
            deviceStatus.totalTime = compareCurrentDateWithMinutePeriodResult.totalTimeSeconds;
        }
        return;
        // First check if current minute is in the specified tariff From-To interval
        // const isCurrentMinuteInTariffPeriod = this.dateTimeHelper.isCurrentMinuteInMinutePeriod(tariffFromMinute, tariffToMinute);
        // if (!isCurrentMinuteInTariffPeriod) {
        //     // Must be stopped
        //     deviceStatus.started = false;
        //     deviceStatus.expectedEndAt = now;
        //     deviceStatus.stoppedAt = now;
        //     deviceStatus.remainingSeconds = 0;
        //     return;
        // }

        // Since the above check could return true even if the device was started a long time ago 
        // like if the server was turned off for days and started, the current minute could be in the tariff's From-To interval,
        // but the device must be stopped, since current date-time is past the "To" value

        const nowDate = this.getNowAsDate();
        const nowAsNumber = this.dateTimeHelper.getCurrentDateTimeAsNumber();
        const tariffCrossesMidnight = tariffFromMinute > tariffToMinute;
        // Calculate the end of the session - this is startedAt plus minutes to "To" value

        // Check if now has passed the "To" minute of the same day as when it was started
        const nowMinute = nowDate.getHours() * 60 + nowDate.getMinutes();

        const tariffLengthInMinutes = tariffCrossesMidnight ? 1440 - tariffFromMinute + tariffToMinute : tariffToMinute - tariffFromMinute;
        // Calculate maximum minutes available - this should be the difference between now and the tariff's To value
        // const usedMinutes = (nowAsNumber - startedAt)
        // If used time is more than tariffLengthInMinutes, the device must be stopped
        // This is safe-check - needed just to properly determine if the device must be stopped
        // in case the server has been stopped for a long time and then started at time, which is inside the tariff From-To period

        if (!tariffCrossesMidnight) {
            // Does not cross midnight - simply check if current minute is between tariff's From and To
            const isNowInTariffFromTo = nowMinute >= tariffFromMinute && nowMinute <= tariffToMinute;
            if (isNowInTariffFromTo) {
                // Still in tariff From-To period
            } else {
                // No longer in tariff From-To period
            }
        } else {

        }
        // const diffMs = now - startedAt;
        // const tariffDurationMs = tariff.duration! * 60 * 1000;
        // // totalTime must be in seconds
        // deviceStatus.totalTime = Math.ceil(diffMs / 1000);
        // deviceStatus.totalSum = tariff.price;
        // if (diffMs >= tariffDurationMs) {
        //     // Must be stopped
        //     deviceStatus.started = false;
        //     deviceStatus.expectedEndAt = now;
        //     deviceStatus.stoppedAt = now;
        //     deviceStatus.remainingSeconds = 0;
        // } else {
        //     // Still in the tariff duration
        //     deviceStatus.expectedEndAt = startedAt + tariffDurationMs;
        //     const remainingMs = deviceStatus.expectedEndAt - now;
        //     const remainingSeconds = Math.floor(remainingMs / 1000);
        //     deviceStatus.remainingSeconds = remainingSeconds;
        // }
    }

    // private async calculateDeviceStatuses(storageDeviceStatuses: IDeviceStatus[]): Promise<DeviceStatus[]> {
    // TODO: Collect all the necessary information and calculate device statuses
    //       Stop these that must be stopped
    // }

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

    private getNowAsDate(): Date {
        return new Date();
    }

    private getNowAsIsoString(): string {
        return new Date().toISOString();
    }

    private getStringDateFromNumber(date: number): string {
        return new Date(date).toISOString();
    }

    private getNumberFromDate(date?: string | null): number | null {
        if (!date) {
            return null;
        }
        return new Date(date).getTime();
    }

    private createDefaultState(): StateManagerState {
        const state: StateManagerState = {
            systemSettings: {
                device_status_refresh_interval: 10 * 1000,
                // 1800 seconds = 30 minutes
                token_duration: 1800 * 1000,
                timezone: 'Europe/Sofia',
            },
            lastDeviceStatusRefreshAt: 0,
            deviceStatusRefreshInProgress: false,
            mainTimerHandle: undefined,
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

    async terminate(): Promise<void> {
        this.logger.warn('Terminating');
        clearInterval(this.state.mainTimerHandle);
        await this.storageProvider.stop();
        await this.subClient.disconnect();
        await this.pubClient.disconnect();
        await this.cacheClient.disconnect();
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
    mainTimerHandle?: NodeJS.Timeout;
}

interface StateManagerStateSystemSettings {
    [SystemSettingName.device_status_refresh_interval]: number;
    [SystemSettingName.token_duration]: number;
    [SystemSettingName.timezone]: string;
}

interface UserAuthDataCacheValue {
    userId: number;
    roundtripData: OperatorConnectionRoundTripData;
    permissions: string[];
    setAt: number;
    token: string;
    tokenExpiresAt: number;
}
