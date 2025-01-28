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
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { BusOperatorConnectionEventMessage } from '@computerclubsystem/types/messages/bus/bus-operator-connection-event.message.mjs';
import { IOperatorConnectionEvent } from './storage/entities/operator-connection-event.mjs';
import { BusOperatorGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-get-all-devices-request.message.mjs';
import { createBusOperatorGetAllDevicesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-operator-get-all-devices-reply.message.mjs';
import { BusDeviceGetByIdRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id-request.message.mjs';
import { createBusDeviceGetByIdReplyMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id-reply.message.mjs';
import { BusUpdateDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-request.message.mjs';
import { createBusUpdateDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-reply.message.mjs';
import { IDeviceStatus, IDeviceStatusWithContinuationData } from './storage/entities/device-status.mjs';
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
import { IDeviceSession } from './storage/entities/device-session.mjs';
import { BusGetAllRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-roles-request.message.mjs';
import { createBusGetAllRolesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-roles-reply.message.mjs';
import { BusGetRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-role-with-permissions-request.message.mjs';
import { createBusGetRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-role-with-permissions-reply.message.mjs';
import { BusGetAllPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-permissions-request.message.mjs';
import { createBusGetAllPermissionsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-permissions-reply.message.mjs';
import { BusCreateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-role-with-permissions-request.message.mjs';
import { createBusCreateRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-role-with-permissions-reply.message.mjs';
import { Role } from '@computerclubsystem/types/entities/role.mjs';
import { BusUpdateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-role-with-permissions-request.message.mjs';
import { createBusUpdateRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-role-with-permissions-reply.message.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { createBusGetAllUsersReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-users-reply.message.mjs';
import { BusGetAllUsersRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-users-request.message.mjs';
import { BusCreateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-user-with-roles-request.message.mjs';
import { createBusCreateUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-user-with-roles-reply.message.mjs';
import { User } from '@computerclubsystem/types/entities/user.mjs';
import { BusGetUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-user-with-roles-request.message.mjs';
import { createBusGetUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-user-with-roles-reply.message.mjs';
import { createBusUpdateUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-user-with-roles-reply.message.mjs';
import { BusUpdateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-user-with-roles-request.message.mjs';
import { BusStopDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-stop-device-request.message.mjs';
import { createBusStopDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-stop-device-reply.message.mjs';
import { BusTransferDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-transfer-device-request.message.mjs';
import { createBusTransferDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-transfer-device-reply.message.mjs';
import { SystemNotes } from './system-notes.mjs';
import { IDeviceContinuation } from './storage/entities/device-continuation.mjs';
import { DeviceContinuation } from '@computerclubsystem/types/entities/device-continuation.mjs';
import { BusCreateDeviceContinuationRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-continuation-request.message.mjs';
import { createBusCreateDeviceContinuationReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-continuation-reply.message.mjs';
import { BusDeleteDeviceContinuationRequestMessage } from '@computerclubsystem/types/messages/bus/bus-delete-device-continuation-request.message.mjs';
import { createBusDeleteDeviceContinuationReplyMessage } from '@computerclubsystem/types/messages/bus/bus-delete-device-continuation-reply.message.mjs';
import { TariffValidator } from './tariff-validator.mjs';
import { BusRechargeTariffDurationRequestMessage } from '@computerclubsystem/types/messages/bus/bus-recharge-tariff-duration-request.message.mjs';
import { createBusRechargeTariffDurationReplyMessage } from '@computerclubsystem/types/messages/bus/bus-recharge-tariff-duration-reply.message.mjs';
import { ITariff } from './storage/entities/tariff.mjs';
import { IncreaseTariffRemainingSecondsResult } from './storage/results.mjs';

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
    private readonly tariffValidator = new TariffValidator();
    private readonly dateTimeHelper = new DateTimeHelper();
    private readonly systemNotes = new SystemNotes();
    private readonly envVars = new EnvironmentVariablesHelper().createEnvironmentVars();

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
                this.processDevicesChannelMessage(message);
                break;
            case ChannelName.operators:
                this.processOperatorsChannelMessage(message);
                break;
            case ChannelName.shared:
                break;
        }
    }

    processOperatorsChannelMessage<TBody>(message: Message<TBody>): void {
        const type = message.header?.type;
        switch (type) {
            case MessageType.busRechargeTariffDurationRequest:
                this.processBusRechargeTariffDurationRequestMessage(message as BusRechargeTariffDurationRequestMessage);
                break;
            case MessageType.busDeleteDeviceContinuationRequest:
                this.processBusDeleteDeviceContinuationRequestMessage(message as BusDeleteDeviceContinuationRequestMessage);
                break;
            case MessageType.busCreateDeviceContinuationRequest:
                this.processBusCreateDeviceContinuationRequestMessage(message as BusCreateDeviceContinuationRequestMessage);
                break;
            case MessageType.busTransferDeviceRequest:
                this.processBusTransferDeviceRequestMessage(message as BusTransferDeviceRequestMessage);
                break;
            case MessageType.busStopDeviceRequest:
                this.processBusStopDeviceRequestMessage(message as BusStopDeviceRequestMessage);
                break;
            case MessageType.busUpdateUserWithRolesRequest:
                this.processBusUpdateUserWithRolesRequestMessage(message as BusUpdateUserWithRolesRequestMessage);
                break;
            case MessageType.busCreateUserWithRolesRequest:
                this.processBusCreateUserWithRolesRequestMessage(message as BusCreateUserWithRolesRequestMessage);
                break;
            case MessageType.busGetUserWithRolesRequest:
                this.processBusGetUserWithRolesRequestMessage(message as BusGetUserWithRolesRequestMessage);
                break;
            case MessageType.busGetAllUsersRequest:
                this.processBusGetAllUsersRequestMessage(message as BusGetAllUsersRequestMessage);
                break;
            case MessageType.busCreateRoleWithPermissionsRequest:
                this.processBusCreateRoleWithPermissionsRequestMessage(message as BusCreateRoleWithPermissionsRequestMessage);
                break;
            case MessageType.busUpdateRoleWithPermissionsRequest:
                this.processBusUpdateRoleWithPermissionsRequestMessage(message as BusUpdateRoleWithPermissionsRequestMessage);
                break;
            case MessageType.busGetAllPermissionsRequest:
                this.processBusGetAllPermissionsRequestMessage(message as BusGetAllPermissionsRequestMessage);
                break;
            case MessageType.busGetRoleWithPermissionsRequest:
                this.processBusGetRoleWithPermissionsRequestMessage(message as BusGetRoleWithPermissionsRequestMessage);
                break;
            case MessageType.busGetAllRolesRequest:
                this.processBusGetAllRolesRequestMessage(message as BusGetAllRolesRequestMessage);
                break;
            case MessageType.busStartDeviceRequest:
                this.processBusStartDeviceRequestMessage(message as BusStartDeviceRequestMessage);
                break;
            case MessageType.busGetTariffByIdRequest:
                this.processBusGetTariffByIdRequestMessage(message as BusGetTariffByIdRequestMessage);
                break;
            case MessageType.busCreateTariffRequest:
                this.processBusCreateTariffRequestMessage(message as BusCreateTariffRequestMessage);
                break;
            case MessageType.busUpdateTariffRequest:
                this.processBusUpdateTariffRequestMessage(message as BusUpdateTariffRequestMessage);
                break;
            case MessageType.busGetAllTariffsRequest:
                this.processBusGetAllTariffsRequestMessage(message as BusGetAllTariffsRequestMessage);
                break;
            case MessageType.busUpdateDeviceRequest:
                this.processBusUpdateDeviceRequest(message as BusUpdateDeviceRequestMessage);
                break;
            case MessageType.busOperatorGetDeviceByIdRequest:
                this.processBusOperatorGetDeviceByIdRequest(message as BusDeviceGetByIdRequestMessage);
                break;
            case MessageType.busOperatorGetAllDevicesRequest:
                this.processBusOperatorGetAllDevicesRequest(message as BusOperatorGetAllDevicesRequestMessage);
                break;
            case MessageType.busOperatorAuthRequest:
                this.processBusOperatorAuthRequest(message as BusOperatorAuthRequestMessage);
                break;
            case MessageType.busOperatorConnectionEvent:
                this.processBusOperatorConnectionEvent(message as BusOperatorConnectionEventMessage);
                break;
        }
    }

    processDevicesChannelMessage<TBody>(message: Message<TBody>): void {
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

    async processBusRechargeTariffDurationRequestMessage(message: BusRechargeTariffDurationRequestMessage): Promise<void> {
        const replyMsg = createBusRechargeTariffDurationReplyMessage();
        try {
            if (!message.body.tariffId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIdIsRequired,
                    description: 'Tariff Id is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!message.body.userId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: 'User Id is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const allTariffs = await this.getAndCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === message.body.tariffId);
            if (!tariff) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffNotFound,
                    description: 'Tariff not provided',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!tariff.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIsNotActive,
                    description: `Specified tariff Id ${tariff.id} (${tariff.name}) is not active`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (tariff.type !== TariffType.prepaid) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIsNotPrepaidType,
                    description: `Specified tariff Id ${tariff.id} (${tariff.name}) is not of prepaid type`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            // Tariff duration is in minutes - we must convert it to seconds
            const tariffDuration = tariff.duration!;
            const tariffDurationSeconds = tariffDuration * 60;
            const increasedAt = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const increaseResult = await this.increaseTariffRemainingSeconds(tariff.id, tariffDurationSeconds, message.body.userId, increasedAt);
            if (!increaseResult) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.cantIncreaseTariffRemainingTime,
                    description: `Can't increase tariff Id ${tariff.id} (${tariff.name}) remaining time`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            replyMsg.body.tariff = this.entityConverter.storageTariffToTariff(increaseResult.tariff);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusRechargeTariffDurationRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusDeleteDeviceContinuationRequestMessage(message: BusDeleteDeviceContinuationRequestMessage): Promise<void> {
        const replyMsg = createBusDeleteDeviceContinuationReplyMessage();
        try {
            if (!message.body.deviceId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIdIsRequired,
                    description: 'Device Id is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            await this.storageProvider.deleteDeviceContinuation(message.body.deviceId);
            await this.refreshDeviceStatuses();
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusDeleteDeviceContinuationRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusCreateDeviceContinuationRequestMessage(message: BusCreateDeviceContinuationRequestMessage): Promise<void> {
        const replyMsg = createBusCreateDeviceContinuationReplyMessage();
        try {
            const deviceContinuation: DeviceContinuation = message.body?.deviceContinuation;
            if (!deviceContinuation) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.objectIsRequired,
                    description: 'Device continuation is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!deviceContinuation.deviceId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIdIsRequired,
                    description: 'Device Id is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!deviceContinuation.tariffId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIdIsRequired,
                    description: 'Tariff Id is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!deviceContinuation.userId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: 'User Id is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const allDevices = await this.getAndCacheAllDevices();
            const device = allDevices.find(x => x.id === deviceContinuation.deviceId);
            if (!device) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceNotFound,
                    description: `Device with Id ${deviceContinuation.deviceId} not found`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!device?.approved || !device?.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIsNotActive,
                    description: `Device with Id ${deviceContinuation.deviceId} is not active`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const allTariffs = await this.getAndCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === deviceContinuation.tariffId);
            if (!tariff) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffNotFound,
                    description: `Tariff with Id ${deviceContinuation.tariffId} not found`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!tariff.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIsNotActive,
                    description: `Tariff with Id ${deviceContinuation.tariffId} is not active`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const user = await this.storageProvider.getUserById(deviceContinuation.userId);
            if (!user) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userNotFound,
                    description: `User with Id ${deviceContinuation.userId} not found`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!user.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIsNotActive,
                    description: `User with Id ${deviceContinuation.userId} not found`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            // TODO: Check if at the time of starting the selected tariff it will be valid to be used
            const storageDeviceStatus = await this.storageProvider.getDeviceStatus(deviceContinuation.deviceId);
            if (!storageDeviceStatus?.started) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIsNotStarted,
                    description: `Device with Id ${deviceContinuation.tariffId} is not started`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const currentDeviceTariff = allTariffs.find(x => x.id === storageDeviceStatus.start_reason)!;
            const isTariffAvailableAtResult = this.isTariffAvailableAfterDeviceStop(currentDeviceTariff, tariff, storageDeviceStatus);
            if (!isTariffAvailableAtResult.isAvailable) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.cantStartTheTariffNow,
                    description: `The tariff ${deviceContinuation.tariffId} is not available at the specified time`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const storageDeviceContinuation = this.entityConverter.deviceContinuationToStorageDeviceContinuation(deviceContinuation);
            storageDeviceContinuation.requestedAt = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdDeviceContinuation = await this.storageProvider.createDeviceContinuation(storageDeviceContinuation);
            const replyDeviceContinuation = this.entityConverter.storageDeviceContinuationToDeviceContinuation(createdDeviceContinuation);
            replyDeviceContinuation.requestedAt = this.dateTimeHelper.getNumberFromISOStringDateTime(createdDeviceContinuation.requestedAt)!;
            // TODO: Refresh only this device status
            await this.refreshDeviceStatuses()
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusCreateDeviceContinuationRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    getExpectedEndAt(tariff: Tariff, startedAt: number): number | null | undefined {
        switch (tariff.type) {
            case TariffType.duration:
                const tariffDurationMs = tariff.duration! * 60 * 1000;
                const expectedEndAt = startedAt + tariffDurationMs;
                return expectedEndAt;
            case TariffType.fromTo:
                const res = this.dateTimeHelper.compareCurrentDateWithMinutePeriod(startedAt, tariff.fromTime!, tariff.toTime!);
                return res.expectedEndAt;
        }
    }

    isTariffAvailableAfterDeviceStop(currentDeviceTariff: Tariff, continuationTariff: Tariff, storageDeviceStatus: IDeviceStatus): { isAvailable: boolean } {
        const startedAt = this.dateTimeHelper.getNumberFromISOStringDateTime(storageDeviceStatus.started_at)!;
        switch (continuationTariff.type) {
            case TariffType.duration:
                if (continuationTariff.restrictStartTime) {
                    // Calculate when the current device session will end
                    const expectedEndAt = this.getExpectedEndAt(currentDeviceTariff, startedAt);
                    if (expectedEndAt) {
                        const expectedEndMinute = this.dateTimeHelper.getDateTimeMinute(expectedEndAt);
                        const isInMinutePeriod = this.dateTimeHelper.isInMinutePeriod(continuationTariff.restrictStartFromTime!, continuationTariff.restrictStartToTime!, expectedEndMinute);
                        return { isAvailable: isInMinutePeriod };
                    } else {
                        return { isAvailable: false };
                    }
                } else {
                    // Duration tariff which is not restricted can be started any time
                    return { isAvailable: true };
                }
            case TariffType.fromTo:
                const expectedEndAt = this.getExpectedEndAt(currentDeviceTariff, startedAt);
                if (expectedEndAt) {
                    const expectedEndMinute = this.dateTimeHelper.getDateTimeMinute(expectedEndAt);
                    const isInMinutePeriod = this.dateTimeHelper.isInMinutePeriod(continuationTariff.fromTime!, continuationTariff.toTime!, expectedEndMinute);
                    return { isAvailable: isInMinutePeriod };
                } else {
                    // Cannot determine extpectedEndAt means the current datetime is out of the tariff period and the device must be stopped
                    return { isAvailable: false };
                }
        }
        return { isAvailable: false };
    }

    async processBusTransferDeviceRequestMessage(message: BusTransferDeviceRequestMessage): Promise<void> {
        const replyMsg = createBusTransferDeviceReplyMessage();
        try {
            const { sourceDeviceId, targetDeviceId, userId } = message.body;
            if (!sourceDeviceId || !targetDeviceId || !userId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.allIdsAreRequired,
                    description: 'Source device id, target device id and user id are required',
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const sourceDeviceStoreStatus = await this.storageProvider.getDeviceStatus(sourceDeviceId);
            if (!sourceDeviceStoreStatus) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceNotFound,
                    description: 'Source device not found',
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!sourceDeviceStoreStatus.started) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.sourceDeviceMustBeStarted,
                    description: 'Source device must be started',
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const targetDeviceStoreStatus = await this.storageProvider.getDeviceStatus(targetDeviceId);
            if (!targetDeviceStoreStatus) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceNotFound,
                    description: 'Target device not found',
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (targetDeviceStoreStatus.started) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.targetDeviceMustBeStopped,
                    description: 'Target device must be stopped',
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const user = await this.storageProvider.getUserById(userId);
            if (!user || !user.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userNotFound,
                    description: 'User not found',
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const transferDeviceResult = await this.storageProvider.transferDevice(sourceDeviceStoreStatus.device_id, targetDeviceStoreStatus.device_id, userId);
            if (!transferDeviceResult) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: '',
                    description: `Can't transfer device ${sourceDeviceId} to ${targetDeviceId}`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            replyMsg.body.sourceDeviceStatus = this.entityConverter.storageDeviceStatusToDeviceStatus(transferDeviceResult.sourceDeviceStatus);
            replyMsg.body.targetDeviceStatus = this.entityConverter.storageDeviceStatusToDeviceStatus(transferDeviceResult.targetDeviceStatus);
            await this.refreshDeviceStatuses();
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusTransferDeviceRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusStopDeviceRequestMessage(message: BusStopDeviceRequestMessage): Promise<void> {
        const replyMsg = createBusStopDeviceReplyMessage();
        try {
            const deviceId = message.body.deviceId;
            if (!deviceId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIdIsRequired,
                    description: 'Device Id is required',
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const userIdIsRequiredButNotProvided = (!message.body.stoppedByCustomer && !message.body.userId);
            if (userIdIsRequiredButNotProvided) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: 'User Id is required',
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const userIdProvidedButShouldnt = (message.body.stoppedByCustomer && message.body.userId);
            if (userIdProvidedButShouldnt) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdMustNotBeProvided,
                    description: 'User Id must not be provided when the device is stopped by anonymous customer',
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const storageDeviceStatus = await this.storageProvider.getDeviceStatus(deviceId);
            if (!storageDeviceStatus?.started) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIsNotStarted,
                    description: `Device ${deviceId} is not started`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const storageDevice = await this.storageProvider.getDeviceById(deviceId);
            if (!storageDevice) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceNotFound,
                    description: `Device ${deviceId} is not found`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const isDeviceActive = storageDevice.approved && storageDevice.enabled;
            if (!isDeviceActive) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIsNotActive,
                    description: `Device ${deviceId} is not active (either not approved or not enabled)`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }

            const diffMs = this.dateTimeHelper.getCurrentDateTimeAsNumber() - this.dateTimeHelper.getNumberFromISOStringDateTime(storageDeviceStatus.started_at)!;
            // totalTime must be in seconds
            const totalTime = Math.ceil(diffMs / 1000);
            storageDeviceStatus.started = false;
            storageDeviceStatus.stopped_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            storageDeviceStatus.stopped_by_user_id = message.body.userId;
            const deviceStatus = this.createDeviceStatusFromStorageDeviceStatus(storageDeviceStatus);
            // totalTime must be in seconds
            deviceStatus.totalTime = totalTime;
            const storageDeviceSession: IDeviceSession = {
                device_id: storageDeviceStatus.device_id,
                started_at: storageDeviceStatus.started_at,
                stopped_at: storageDeviceStatus.stopped_at,
                tariff_id: storageDeviceStatus.start_reason,
                total_amount: storageDeviceStatus.total,
                started_by_user_id: storageDeviceStatus.started_by_user_id,
                stopped_by_user_id: storageDeviceStatus.stopped_by_user_id,
                started_by_customer: !storageDeviceStatus.started_by_user_id,
                stopped_by_customer: !!message.body.stoppedByCustomer,
                note: message.body.note,
            } as IDeviceSession;
            const allTariffs = await this.getAndCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === deviceStatus.tariff);
            if (tariff?.type === TariffType.prepaid) {
                await this.decreaseTariffRemainingSeconds(tariff.id, tariff.remainingSeconds!, totalTime);
            }
            const completeDeviceStatusUpdateResult = await this.storageProvider.completeDeviceStatusUpdate(storageDeviceStatus, storageDeviceSession);
            if (!completeDeviceStatusUpdateResult) {
                throw new Error(`Can't stop the device`);
            }
            replyMsg.body.deviceStatus = deviceStatus;
            await this.refreshDeviceStatuses();
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusStopDeviceRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusUpdateUserWithRolesRequestMessage(message: BusUpdateUserWithRolesRequestMessage): Promise<void> {
        const replyMsg = createBusUpdateUserWithRolesReplyMessage();
        const user: User = message.body.user;
        if (!user?.id) {
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: BusErrorCode.userIdIsRequired,
                description: 'User Id is required',
            }] as MessageError[];
            this.publishToOperatorsChannel(replyMsg, message);
            return;
        }
        try {
            const storageUser = this.entityConverter.userToStorageUser(user);
            storageUser.updated_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdStorageUser = await this.storageProvider.updateUserWithRoles(storageUser, message.body.roleIds || [], message.body.passwordHash);
            if (createdStorageUser) {
                replyMsg.body.user = this.entityConverter.storageUserToUser(createdStorageUser);
                replyMsg.body.roleIds = message.body.roleIds;
            } else {
                this.logger.warn(`Can't process BusUpdateUserWithRolesRequestMessage message. User was not updated`, message);
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userNotUpdated,
                    description: 'User was not updated',
                }];
            }
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusUpdateUserWithRolesRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetUserWithRolesRequestMessage(message: BusGetUserWithRolesRequestMessage): Promise<void> {
        const replyMsg = createBusGetUserWithRolesReplyMessage();
        try {
            const userId = message.body?.userId;
            if (!userId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: 'User Id is required.',
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const storageUser = await this.storageProvider.getUserById(message.body.userId);
            if (!storageUser) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userNotFound,
                    description: `User with specified Id ${userId} is not found.`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const userRoleIds = await this.storageProvider.getUserRoleIds(userId);
            replyMsg.body.user = this.entityConverter.storageUserToUser(storageUser);
            replyMsg.body.roleIds = userRoleIds;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetUserWithRolesRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusCreateUserWithRolesRequestMessage(message: BusCreateUserWithRolesRequestMessage): Promise<void> {
        const replyMsg = createBusCreateUserWithRolesReplyMessage();
        const user: User = message.body.user;
        const messageErrors = this.getUserValidationMessageErrors(user, false);
        if (messageErrors) {
            replyMsg.header.failure = true;
            replyMsg.header.errors = messageErrors;
            this.publishToOperatorsChannel(replyMsg, message);
            return;
        }
        if (this.isWhiteSpace(message.body.passwordHash)) {
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: BusErrorCode.passwordHashIsRequired,
                description: 'Password sha512 hash is required',
            }] as MessageError[];
            this.publishToOperatorsChannel(replyMsg, message);
            return;
        }
        try {
            const storageUser = this.entityConverter.userToStorageUser(user);
            storageUser.created_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdStorageUser = await this.storageProvider.createUserWithRoles(storageUser, message.body.passwordHash, message.body.roleIds || []);
            if (createdStorageUser) {
                replyMsg.body.user = this.entityConverter.storageUserToUser(createdStorageUser);
                replyMsg.body.roleIds = message.body.roleIds;
            } else {
                this.logger.warn(`Can't process BusCreateUserWithRolesRequestMessage message. User was not created`, message);
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userNotCreated,
                    description: 'User was not created',
                }];
            }
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusCreateUserWithRolesRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetAllUsersRequestMessage(message: BusGetAllUsersRequestMessage): Promise<void> {
        const replyMsg = createBusGetAllUsersReplyMessage();
        try {
            const allStorageUsers = await this.storageProvider.getAllUsers();
            const allUsers = allStorageUsers.map(x => this.entityConverter.storageUserToUser(x))
            replyMsg.body.users = allUsers;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetAllUsersRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusUpdateRoleWithPermissionsRequestMessage(message: BusUpdateRoleWithPermissionsRequestMessage): Promise<void> {
        const replyMsg = createBusUpdateRoleWithPermissionsReplyMessage();
        const role: Role = message.body.role;
        const messageErrors = this.getRoleValidationMessageErrors(role, true);
        if (messageErrors) {
            replyMsg.header.failure = true;
            replyMsg.header.errors = messageErrors;
            this.publishToOperatorsChannel(replyMsg, message);
            return;
        }
        try {
            const storageRole = this.entityConverter.roleToStorageRole(role);
            const updatedStorageRole = await this.storageProvider.updateRoleWithPermissions(storageRole, message.body.permissionIds || []);
            if (updatedStorageRole) {
                replyMsg.body.role = this.entityConverter.storageRoleToRole(updatedStorageRole);
            } else {
                this.logger.warn(`Can't process BusUpdateRoleWithPermissionsRequestMessage message. Role was not updated`, message);
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.roleNotFound,
                    description: 'Role was not found',
                }];
            }
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusUpdateRoleWithPermissionsRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusCreateRoleWithPermissionsRequestMessage(message: BusCreateRoleWithPermissionsRequestMessage): Promise<void> {
        const replyMsg = createBusCreateRoleWithPermissionsReplyMessage();
        const role: Role = message.body.role;
        const messageErrors = this.getRoleValidationMessageErrors(role, false);
        if (messageErrors) {
            replyMsg.header.failure = true;
            replyMsg.header.errors = messageErrors;
            this.publishToOperatorsChannel(replyMsg, message);
            return;
        }
        try {
            const storageRole = this.entityConverter.roleToStorageRole(role);
            const createdStorageRole = await this.storageProvider.createRoleWithPermissions(storageRole, message.body.permissionIds || []);
            if (createdStorageRole) {
                replyMsg.body.role = this.entityConverter.storageRoleToRole(createdStorageRole);
            } else {
                this.logger.warn(`Can't process BusCreateRoleWithPermissionsRequestMessage message. Role was not created`, message);
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.roleNotCreated,
                    description: 'Role was not created',
                }];
            }
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusCreateRoleWithPermissionsRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetAllPermissionsRequestMessage(message: BusGetAllPermissionsRequestMessage): Promise<void> {
        const replyMsg = createBusGetAllPermissionsReplyMessage();
        try {
            const allPermissions = await this.cacheHelper.getAllPermissions();
            replyMsg.body.permissions = allPermissions;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetAllPermissionsRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetRoleWithPermissionsRequestMessage(message: BusGetRoleWithPermissionsRequestMessage): Promise<void> {
        const replyMsg = createBusGetRoleWithPermissionsReplyMessage();
        if (!message.body.roleId) {
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: BusErrorCode.roleIdIsRequired,
                description: 'Role Id is required to get role and permissions',
            }];
            this.publishToOperatorsChannel(replyMsg, message);
            return;
        }
        try {
            const storageRole = await this.storageProvider.getRoleById(message.body.roleId);
            if (!storageRole) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.roleNotFound,
                    description: `Role with specified Id ${message.body.roleId} was not found`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const rolePermissionIds = await this.storageProvider.getRolePermissionIds(message.body.roleId);
            const allPermissions = await this.cacheHelper.getAllPermissions();
            replyMsg.body.role = this.entityConverter.storageRoleToRole(storageRole);
            replyMsg.body.allPermissions = allPermissions;
            replyMsg.body.rolePermissionIds = rolePermissionIds;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetRoleWithPermissionsRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetAllRolesRequestMessage(message: BusGetAllRolesRequestMessage): Promise<void> {
        const replyMsg = createBusGetAllRolesReplyMessage();
        try {
            const allStorageRoles = await this.storageProvider.getAllRoles();
            const allRoles = allStorageRoles.map(storageTole => this.entityConverter.storageRoleToRole(storageTole));
            replyMsg.body.roles = allRoles;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetAllRolesRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusStartDeviceRequestMessage(message: BusStartDeviceRequestMessage): Promise<void> {
        // TODO: This function can be called from operator-connector as well from pc-connector if the computer is started by customer
        //       We need to determine which channel to use for reply
        try {
            // TODO: Some tariff types can be started from customers, which do not have accounts in the system and the userId will be empty
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

            if (tariff.type === TariffType.prepaid) {
                const hasRemainingSeconds = !!(tariff.remainingSeconds! > 0);
                if (!hasRemainingSeconds) {
                    const replyMsg = createBusStartDeviceReplyMessage();
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [
                        { code: BusErrorCode.noRemainingTimeLeft, description: `The tariff '${tariff.name}' has no time remaining` },
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
            currentStorageDeviceStatus.started_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            currentStorageDeviceStatus.stopped_at = null;
            currentStorageDeviceStatus.total = tariff.price;
            currentStorageDeviceStatus.started_by_user_id = message.body.userId;
            await this.storageProvider.updateDeviceStatus(currentStorageDeviceStatus);
            const replyMsg = createBusStartDeviceReplyMessage();
            replyMsg.body.deviceStatus = this.createAndCalculateDeviceStatusFromStorageDeviceStatus(currentStorageDeviceStatus, tariff);
            await this.refreshDeviceStatuses();
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusStartDeviceRequestMessage message`, message, err);
            const replyMsg = createBusStartDeviceReplyMessage();
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusUpdateTariffRequestMessage(message: BusUpdateTariffRequestMessage): Promise<void> {
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
            const updatedTariff = await this.storageProvider.updateTariff(storageTariff, message.body.passwordHash);
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

    async processBusGetTariffByIdRequestMessage(message: BusGetTariffByIdRequestMessage): Promise<void> {
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

    async processBusCreateTariffRequestMessage(message: BusCreateTariffRequestMessage): Promise<void> {
        try {
            const requestedTariffToCreate: Tariff = message.body.tariff;
            const validateTariffResult = this.tariffValidator.validateTariff(requestedTariffToCreate);
            if (!validateTariffResult.success) {
                const replyMsg = createBusCreateTariffReplyMessage(message);
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: validateTariffResult.errorCode as unknown as BusErrorCode,
                    description: validateTariffResult.errorMessage,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (requestedTariffToCreate.type === TariffType.prepaid) {
                if (!message.body.passwordHash) {
                    const replyMsg = createBusCreateTariffReplyMessage(message);
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.passwordHashIsRequired,
                        description: `Password hash is required when creating '${TariffType.prepaid}' tariff`,
                    }];
                    this.publishToOperatorsChannel(replyMsg, message);
                    return;
                }
            }
            const tariffToCreate = this.tariffHelper.createTariffFromRequested(requestedTariffToCreate);
            const storageTariffToCreate = this.entityConverter.tariffToStorageTariff(tariffToCreate);
            storageTariffToCreate.created_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const passwordHash = requestedTariffToCreate.type === TariffType.prepaid ? message.body.passwordHash : undefined;
            const createdStorageTariff = await this.storageProvider.createTariff(storageTariffToCreate, passwordHash);
            await this.cacheAllTariffs();
            const replyMsg = createBusCreateTariffReplyMessage(message);
            const createdTariff = this.entityConverter.storageTariffToTariff(createdStorageTariff);
            replyMsg.body.tariff = createdTariff;
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

    async processBusGetAllTariffsRequestMessage(message: BusGetAllTariffsRequestMessage): Promise<void> {
        try {
            const allTariffs = await this.storageProvider.getAllTariffs(message.body.types);
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

    async processBusUpdateDeviceRequest(message: BusUpdateDeviceRequestMessage): Promise<void> {
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

    async processBusOperatorGetDeviceByIdRequest(message: BusDeviceGetByIdRequestMessage): Promise<void> {
        try {
            const device = await this.storageProvider.getDeviceById(message.body.deviceId);
            const replyMsg = createBusDeviceGetByIdReplyMessage(message);
            replyMsg.body.device = device && this.entityConverter.storageDeviceToDevice(device);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusDeviceGetByIdRequestMessage message`, message, err);
        }
    }

    async processBusOperatorGetAllDevicesRequest(message: BusOperatorGetAllDevicesRequestMessage): Promise<void> {
        const storageDevices = await this.storageProvider.getAllDevices();
        const replyMsg = createBusOperatorGetAllDevicesReplyMessage(message);
        replyMsg.body.devices = storageDevices.map(storageDevice => this.entityConverter.storageDeviceToDevice(storageDevice));
        this.publishToOperatorsChannel(replyMsg, message);
    }

    async processBusOperatorConnectionEvent(message: BusOperatorConnectionEventMessage): Promise<void> {
        try {
            const operatorConnectionEvent: IOperatorConnectionEvent = {
                operator_id: message.body.operatorId,
                ip_address: message.body.ipAddress,
                note: message.body.note,
                timestamp: this.dateTimeHelper.getCurrentUTCDateTimeAsISOString(),
                type: this.entityConverter.operatorConnectionEventTypeToOperatorConnectionEventStorage(message.body.type),
            } as IOperatorConnectionEvent;
            await this.storageProvider.addOperatorConnectionEvent(operatorConnectionEvent);
        } catch (err) {
            this.logger.warn(`Can't process BusOperatorConnectionEventMessage`, message, err);
        }
    }

    async processBusOperatorAuthRequest(message: BusOperatorAuthRequestMessage): Promise<void> {
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
            const replyMsg = createBusOperatorAuthReplyMessage();
            replyMsg.header.failure = true;
            replyMsg.header.errors = [
                {
                    code: BusErrorCode.cantAuthenticateUser,
                    description: (err as any)?.message,
                }
            ] as MessageError[];
            this.publishToOperatorsChannel(replyMsg, message);
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
                timestamp: this.dateTimeHelper.getCurrentUTCDateTimeAsISOString(),
                type: this.entityConverter.deviceConnectionEventTypeToDeviceConnectionEventStorage(message.body.type),
            } as IDeviceConnectionEvent;
            await this.storageProvider.addDeviceConnectionEvent(deviceConnectionEvent);
        } catch (err) {
            this.logger.warn(`Can't process BusDeviceConnectionEventMessage message`, message, err);
        }
    }

    async getBusOperatorReplyMessageForUsernameAndPasswordHash(username: string, passwordHash: string): Promise<BusOperatorAuthReplyMessage> {
        const replyMsg = createBusOperatorAuthReplyMessage();
        const user = await this.storageProvider.getUserByUsernameAndPasswordHash(username, passwordHash);
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

    async processBusDeviceUnknownDeviceConnectedMessageRequest(message: BusDeviceUnknownDeviceConnectedRequestMessage): Promise<void> {
        try {
            // const connectionRoundtripData = message.header.roundTripData as ConnectionRoundTripData;
            const device: IDevice = {
                approved: false,
                certificate_thumbprint: message.body.certificateThumbprint,
                description: `Certificate: ${message.body.certificateSubject}`,
                name: message.body.certificateCommonName,
                ip_address: message.body.ipAddress,
                created_at: this.dateTimeHelper.getCurrentUTCDateTimeAsISOString(),
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

    private getUserValidationMessageErrors(user: User, idRequired: boolean = false): MessageError[] | undefined {
        let result: MessageError[] | undefined
        if (this.isWhiteSpace(user?.username)) {
            result = [{
                code: BusErrorCode.usernameIsRequired,
                description: 'Username is required',
            }] as MessageError[];
            return result;
        }
        if (idRequired) {
            if (!user?.id) {
                result = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: 'User Id is required',
                }] as MessageError[];
                return result;
            }
        }
        return undefined;
    }

    private getRoleValidationMessageErrors(role: Role, idRequired: boolean = false): MessageError[] | undefined {
        let result: MessageError[] | undefined
        if (this.isWhiteSpace(role?.name)) {
            result = [{
                code: BusErrorCode.roleNameIsRequired,
                description: 'Role name is required',
            }] as MessageError[];
            return result;
        }
        if (idRequired) {
            if (!role?.id) {
                result = [{
                    code: BusErrorCode.roleIdIsRequired,
                    description: 'Role Id is required',
                }] as MessageError[];
                return result;
            }
        }
        return undefined;
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

    private async cacheStaticData(): Promise<void> {
        const storageAllPermissions = await this.storageProvider.getAllPermissions();
        const allPermissions = storageAllPermissions.map(x => this.entityConverter.storagePermissionToPermission(x));
        this.cacheHelper.setAllPermissions(allPermissions);
    }

    private async refreshDeviceStatuses(): Promise<void> {
        try {
            const now = this.dateTimeHelper.getCurrentDateTimeAsNumber();
            this.state.lastDeviceStatusRefreshAt = now;
            this.state.deviceStatusRefreshInProgress = true;
            //            const storageDeviceStatuses = await this.storageProvider.getAllDeviceStatuses();
            const storageDeviceStatusesWithContinuationData = await this.storageProvider.getAllDeviceStatusesWithContinuationData();
            const allTariffs = await this.getAndCacheAllTariffs();
            let allDevices = await this.getAndCacheAllDevices();
            // TODO: We will process only enabled devices
            //       If the user disables device while it is started (the system should prevent this),
            //       it will not be processed here and will remain started until enabled again
            const enabledDevices = allDevices.filter(x => x.approved && x.enabled);
            const deviceStatuses: DeviceStatus[] = [];
            for (const enabledDevice of enabledDevices) {
                const storageDeviceStatus = storageDeviceStatusesWithContinuationData.find(x => x.device_id === enabledDevice.id);
                if (storageDeviceStatus) {
                    const tariff = allTariffs.find(x => x.id === storageDeviceStatus.start_reason)!;
                    let calculatedDeviceStatus = this.createAndCalculateDeviceStatusFromStorageDeviceStatus(storageDeviceStatus, tariff);
                    const originalCalculatedDeviceStatus = calculatedDeviceStatus;
                    if (storageDeviceStatus.started && !calculatedDeviceStatus.started) {
                        // After the calculation, if device was started but no longer, it must be stopped
                        storageDeviceStatus.started = calculatedDeviceStatus.started;
                        storageDeviceStatus.stopped_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
                        storageDeviceStatus.total = calculatedDeviceStatus.totalSum;
                        const shouldStartForContinuationTariffResult = this.shouldStartForContinuationTariff(storageDeviceStatus, allTariffs);
                        const continuationTariff = shouldStartForContinuationTariffResult.continuationTariff;

                        let storageDeviceSessionNote: string | null = null;
                        if (shouldStartForContinuationTariffResult.shouldStart && continuationTariff) {
                            // Continuation is configured and the tariff can be used at this moment
                            storageDeviceSessionNote = this.systemNotes.getContinuationTariffNote(continuationTariff.id, continuationTariff.name);
                        } else if (!shouldStartForContinuationTariffResult.shouldStart && shouldStartForContinuationTariffResult.canUseTariff === false && continuationTariff) {
                            // Continuation is configured but the tariff can't be used at this moment
                            storageDeviceSessionNote = this.systemNotes.getTariffCantBeCurrentlyUsedToContinuationNote(continuationTariff.id, continuationTariff.name);
                        }
                        const storageDeviceSession: IDeviceSession = {
                            device_id: storageDeviceStatus.device_id,
                            started_at: storageDeviceStatus.started_at,
                            stopped_at: storageDeviceStatus.stopped_at,
                            tariff_id: storageDeviceStatus.start_reason,
                            total_amount: calculatedDeviceStatus.totalSum,
                            started_by_user_id: storageDeviceStatus.started_by_user_id,
                            stopped_by_user_id: storageDeviceStatus.stopped_by_user_id,
                            started_by_customer: !storageDeviceStatus.started_by_user_id,
                            // This will always be false, because the system is stopping the computer
                            stopped_by_customer: false,
                            note: storageDeviceSessionNote,
                        } as IDeviceSession;
                        // TODO: If the continuation is configured but the tariff cannot be used right now - send notification message
                        // See if we need to switch to another tariff
                        let shouldPerformContinuation = false;
                        if (shouldStartForContinuationTariffResult.shouldStart && continuationTariff) {
                            storageDeviceStatus.enabled = true;
                            storageDeviceStatus.start_reason = continuationTariff.id;
                            storageDeviceStatus.started = true;
                            storageDeviceStatus.started_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
                            storageDeviceStatus.stopped_at = null;
                            storageDeviceStatus.total = continuationTariff.price;
                            storageDeviceStatus.started_by_user_id = storageDeviceStatus.continuation_user_id;
                            storageDeviceStatus.stopped_by_user_id = null;
                            shouldPerformContinuation = true;
                            calculatedDeviceStatus = this.createAndCalculateDeviceStatusFromStorageDeviceStatus(storageDeviceStatus, continuationTariff);
                            // Set the device will no longer continue - it was already updated to the continuation tariff
                            calculatedDeviceStatus.continuationTariffId = null;
                        }
                        // TODO: Use transaction to change device status table, device session table, device_continuation table
                        // TODO: Also update the device status only if the "started" is true 
                        //       or use hidden PostgreSQL column named "xmin" which contains ID (number) of the last transaction that updated the row
                        //       to avoid race conditions when after this function gets all device statuses, some other message stops a computer before this function
                        //       reaches this point. Rename this function to updateDeviceStatusIfStarted and internally add condition like "WHERE started = true"
                        //       Return result and if the result is null, the update was not performed (possibly because the row for this device had started = false)
                        // await this.storageProvider.updateDeviceStatus(storageDeviceStatus);
                        // await this.storageProvider.addDeviceSession(storageDeviceSession);
                        if (tariff.type === TariffType.prepaid) {
                            // Prepaid tariffs must update their remaining time
                            await this.decreaseTariffRemainingSeconds(tariff.id, tariff.remainingSeconds!, originalCalculatedDeviceStatus.totalTime!);
                        }
                        const completeDeviceStatusUpdateResult = await this.storageProvider.completeDeviceStatusUpdate(storageDeviceStatus, storageDeviceSession);
                        if (!completeDeviceStatusUpdateResult) {
                            // Update failed
                            throw new Error(`Can't complete device status update`);
                        }
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
            this.logger.error(`Can't refresh device statuses`, err);
        } finally {
            this.state.deviceStatusRefreshInProgress = false;
            this.state.lastDeviceStatusRefreshAt = this.dateTimeHelper.getCurrentDateTimeAsNumber();
        }
    }

    private async increaseTariffRemainingSeconds(tariffId: number, secondsToAdd: number, userId: number, increasedAt: string): Promise<IncreaseTariffRemainingSecondsResult  | undefined> {
        const increaseResult = await this.storageProvider.increaseTariffRemainingSeconds(tariffId, secondsToAdd, userId, increasedAt);
        // After the tariff is updated we have to update the cache too, otherwise the tariff will still have the old remaining_seconds
        await this.cacheAllTariffs();
        return increaseResult;
    }

    private async decreaseTariffRemainingSeconds(tariffId: number, currentRemainingSeconds: number, secondsToSubtract: number): Promise<void> {
        // Prepaid tariffs must update their remaining time
        let newRemainingSeconds = currentRemainingSeconds - secondsToSubtract;
        if (newRemainingSeconds < 0) {
            newRemainingSeconds = 0;
        }
        await this.storageProvider.updateTariffRemainingSeconds(tariffId, newRemainingSeconds);
        // After the tariff is updated we have to update the cache too, otherwise the tariff will still have the old remaining_seconds
        // and can be started again even if the remaining seconds are 0
        await this.cacheAllTariffs();
    }

    shouldStartForContinuationTariff(storageDeviceStatus: IDeviceStatusWithContinuationData, allTariffs: Tariff[]): { continuationTariff: Tariff | null, canUseTariff: boolean | null, shouldStart: boolean } {
        if (storageDeviceStatus.continuation_tariff_id) {
            const tariff = allTariffs.find(x => x.id === storageDeviceStatus.continuation_tariff_id);
            if (tariff?.enabled) {
                const canUseTariffResult = this.canUseTariff(tariff);
                if (canUseTariffResult.canUse) {
                    return { continuationTariff: tariff, canUseTariff: true, shouldStart: true };
                } else {
                    return { continuationTariff: tariff, canUseTariff: false, shouldStart: false };
                }
            }
        }
        return { continuationTariff: null, canUseTariff: null, shouldStart: false };
    }
    // TODO: Return result object describing why the tariff can not be used
    canUseTariff(tariff: Tariff): { canUse: boolean } {
        if (tariff.type === TariffType.fromTo) {
            const isCurrentMinuteInPeriodResult = this.dateTimeHelper.isCurrentMinuteInMinutePeriod(tariff.fromTime!, tariff.toTime!);
            this.logger.log('isCurrentMinuteInMinutePeriod: Tariff id', tariff.id, 'fromTime', tariff.fromTime, 'toTime', tariff.toTime, 'result', isCurrentMinuteInPeriodResult);
            if (!isCurrentMinuteInPeriodResult.isInPeriod) {
                return { canUse: false };
                // const replyMsg = createBusStartDeviceReplyMessage();
                // replyMsg.header.failure = true;
                // replyMsg.header.errors = [
                //     { code: BusErrorCode.cantUseTheTariffNow, description: `Can't use the tariff right now` },
                // ];
                // this.publishToOperatorsChannel(replyMsg);
                // return;
            }
        }

        if (tariff.type === TariffType.duration) {
            if (tariff.restrictStartTime) {
                const isCurrentMinuteInPeriodResult = this.dateTimeHelper.isCurrentMinuteInMinutePeriod(tariff.restrictStartFromTime!, tariff.restrictStartToTime!);
                if (!isCurrentMinuteInPeriodResult.isInPeriod) {
                    return { canUse: false };
                    // const replyMsg = createBusStartDeviceReplyMessage();
                    // replyMsg.header.failure = true;
                    // replyMsg.header.errors = [
                    //     { code: BusErrorCode.cantStartTheTariffNow, description: `Can't start the tariff right now` },
                    // ];
                    // this.publishToOperatorsChannel(replyMsg);
                }
            }
        }

        if (tariff.type === TariffType.prepaid) {
            const hasRemainingSeconds = !!(tariff.remainingSeconds && tariff.remainingSeconds > 0);
            if (!hasRemainingSeconds) {
                return { canUse: false };
            }
        }

        return { canUse: true };
    }

    createAndCalculateDeviceStatusFromStorageDeviceStatus(storageDeviceStatus: IDeviceStatus, tariff: Tariff): DeviceStatus {
        const calculatedDeviceStatus = this.createDeviceStatusFromStorageDeviceStatus(storageDeviceStatus);
        if (!calculatedDeviceStatus.started) {
            // If the device is not started - it was already calculated - just return it without modifications
            return calculatedDeviceStatus;
        }
        // The device is started - calculate the elapsed time, remaining time and the total sum
        switch (tariff.type) {
            case TariffType.duration: {
                this.modifyDeviceStatusForDurationTariff(calculatedDeviceStatus, tariff);
                break;
            }
            case TariffType.prepaid: {
                this.modifyDeviceStatusForPerpaidTariff(calculatedDeviceStatus, tariff);
                break;
            }
            case TariffType.fromTo: {
                this.modifyDeviceStatusForFromToTariff(calculatedDeviceStatus, tariff);
                break;
            }
        }
        return calculatedDeviceStatus;
    }

    createDeviceContinuationFromStorageDeviceContinuation(storageDeviceContinuation: IDeviceContinuation): DeviceContinuation {
        const deviceContinuation: DeviceContinuation = {
            deviceId: storageDeviceContinuation.deviceId,
            requestedAt: this.dateTimeHelper.getNumberFromISOStringDateTime(storageDeviceContinuation.requestedAt)!,
            tariffId: storageDeviceContinuation.tariffId,
            userId: storageDeviceContinuation.userId,
        };
        return deviceContinuation;
    }

    createDeviceStatusFromStorageDeviceStatus(storageDeviceStatusWithContinuationData: IDeviceStatusWithContinuationData): DeviceStatus {
        const deviceStatus: DeviceStatus = {
            deviceId: storageDeviceStatusWithContinuationData.device_id,
            enabled: storageDeviceStatusWithContinuationData.enabled,
            started: storageDeviceStatusWithContinuationData.started,
            expectedEndAt: null,
            remainingSeconds: null,
            startedAt: this.dateTimeHelper.getNumberFromISOStringDateTime(storageDeviceStatusWithContinuationData.started_at),
            stoppedAt: this.dateTimeHelper.getNumberFromISOStringDateTime(storageDeviceStatusWithContinuationData.stopped_at),
            totalSum: storageDeviceStatusWithContinuationData.total,
            totalTime: null,
            tariff: storageDeviceStatusWithContinuationData.start_reason,
            startedByUserId: storageDeviceStatusWithContinuationData.started_by_user_id,
            continuationTariffId: storageDeviceStatusWithContinuationData.continuation_tariff_id,
        } as DeviceStatus;
        if (deviceStatus.startedAt && deviceStatus.stoppedAt) {
            deviceStatus.totalTime = Math.floor((deviceStatus.stoppedAt - deviceStatus.startedAt) / 1000);
        }
        return deviceStatus;
    }

    modifyDeviceStatusForPerpaidTariff(deviceStatus: DeviceStatus, tariff: Tariff): void {
        if (!deviceStatus.started) {
            // Stopped devices should have been modified when stopped
            return;
        }
        const now = this.dateTimeHelper.getCurrentDateTimeAsNumber();
        const startedAt = deviceStatus.startedAt!;
        const diffMs = now - startedAt;
        const tariffDurationMs = tariff.remainingSeconds! * 1000;
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
            deviceStatus.expectedEndAt = compareCurrentDateWithMinutePeriodResult.expectedEndAt!;
            deviceStatus.remainingSeconds = compareCurrentDateWithMinutePeriodResult.remainingSeconds!;
            deviceStatus.totalTime = compareCurrentDateWithMinutePeriodResult.totalTimeSeconds;
        }
        return;
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

        await this.cacheStaticData();

        return true;
    }

    async terminate(): Promise<void> {
        this.logger.warn('Terminating');
        clearInterval(this.state.mainTimerHandle);
        await this.pubClient.disconnect();
        await this.subClient.disconnect();
        await this.cacheClient.disconnect();
        await this.storageProvider.stop();
    }
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
