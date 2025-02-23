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
import { BusOperatorAuthRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-auth-request.message.mjs';
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
import { IncreaseTariffRemainingSecondsResult } from './storage/results.mjs';
import { BusStartDeviceOnPrepaidTariffByCustomerRequestMessage } from '@computerclubsystem/types/messages/bus/bus-start-device-on-prepaid-tariff-by-customer-request.message.mjs';
import { createBusStartDeviceOnPrepaidTariffByCustomerReplyMessage } from '@computerclubsystem/types/messages/bus/bus-start-device-on-prepaid-tariff-by-customer-reply.message.mjs';
import { BusEndDeviceSessionByCustomerRequestMessage } from '@computerclubsystem/types/messages/bus/bus-end-device-session-by-customer-request.message.mjs';
import { createBusEndDeviceSessionByCustomerReplyMessage } from '@computerclubsystem/types/messages/bus/bus-end-device-session-by-customer-reply.message.mjs';
import { ITariff } from './storage/entities/tariff.mjs';
import { BusChangePrepaidTariffPasswordByCustomerRequestMessage } from '@computerclubsystem/types/messages/bus/bus-change-prepaid-tariff-password-by-customer-request.message.mjs';
import { createBusChangePrepaidTariffPasswordByCustomerReplyMessage } from '@computerclubsystem/types/messages/bus/bus-change-prepaid-tariff-password-by-customer-reply.message.mjs';
import { BusGetCurrentShiftStatusRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-current-shift-status-request.message.mjs';
import { createBusGetCurrentShiftStatusReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-current-shift-status-reply.message.mjs';
import { ShiftStatus } from '@computerclubsystem/types/entities/shift-status.mjs';
import { BusCompleteShiftRequestMessage } from '@computerclubsystem/types/messages/bus/bus-complete-shift-request.message.mjs';
import { createBusCompleteShiftReplyMessage } from '@computerclubsystem/types/messages/bus/bus-complete-shift-reply.message.mjs';
import { IShift } from './storage/entities/shift.mjs';
import { BusGetShiftsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-shifts-request.message.mjs';
import { createBusGetShiftsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-shifts-reply.message.mjs';
import { BusGetAllSystemSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings-request.message.mjs';
import { createBusGetAllSystemSettingsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings-reply.message.mjs';
import { BusUpdateSystemSettingsValuesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-system-settings-values-request.message.mjs';
import { createBusUpdateSystemSettingsValuesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-system-settings-values-reply.message.mjs';
import { SystemSettingsValidator } from './system-settings-validator.mjs';
import { createBusAllSystemSettingsNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-all-system-settings-notification.message.mjs';
import { BusCreateDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-request.message.mjs';
import { createBusCreateDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-reply.message.mjs';
import { BusCreatePrepaidTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-prepaid-tariff-request.message.mjs';
import { createBusCreatePrepaidTariffReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-prepaid-tariff-reply.message.mjs';
import { BusChangePasswordRequestMessage } from '@computerclubsystem/types/messages/bus/bus-change-password-request.message.mjs';
import { createBusChangePasswordReplyMessage } from '@computerclubsystem/types/messages/bus/bus-change-password-reply.message.mjs';
import { BusGetProfileSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-profile-settings-request.message.mjs';
import { createBusGetProfileSettingsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-profile-settings-reply.message.mjs';
import { UserProfileSettingWithValue } from '@computerclubsystem/types/entities/user-profile-setting-with-value.mjs';
import { BusUpdateProfileSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-profile-settings-request.message.mjs';
import { createBusUpdateProfileSettingsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-profile-settings-reply.message.mjs';
import { IUserProfileSettingWithValue } from './storage/entities/user-profile-setting-with-value.mjs';
import { BusGetAllDeviceGroupsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-device-groups-request.message.mjs';
import { createBusGetAllDeviceGroupsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-device-groups-reply.message.mjs';
import { BusGetDeviceGroupDataRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-group-data-request.message.mjs';
import { createBusGetDeviceGroupDataReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-group-data-reply.message.mjs';
import { DeviceGroupData } from '@computerclubsystem/types/entities/device-group-data.mjs';
import { BusCreateDeviceGroupRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-group-request.message.mjs';
import { createBusCreateDeviceGroupReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-group-reply.message.mjs';
import { DeviceGroup } from '@computerclubsystem/types/entities/device-group.mjs';
import { BusUpdateDeviceGroupRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-group-request.message.mjs';
import { createBusUpdateDeviceGroupReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-group-reply.message.mjs';
import { BusGetAllAllowedDeviceObjectsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-allowed-device-objects-request.message.mjs';
import { createBusGetAllAllowedDeviceObjectsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-allowed-device-objects-reply.message.mjs';
import { AllowedDeviceObjects } from '@computerclubsystem/types/entities/allowed-device-objects.mjs';
import { IDeviceGroup } from './storage/entities/device-group.mjs';
import { ITariffInDeviceGroup } from './storage/entities/tariff-in-device-group.mjs';

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
                this.processSharedChannelMessage(message);
                break;
        }
    }

    processSharedChannelMessage<TBody>(message: Message<TBody>): void {
        const type: string = message.header?.type;
        // const notificationMessage = message as unknown as SharedNotificationMessage<TBody>;
        switch (type) {
            case MessageType.busUpdateSystemSettingsValuesRequest:
                this.processSharedMessageBusUpdateSystemSettingsValues(message as BusUpdateSystemSettingsValuesRequestMessage);
                break;
            case MessageType.busGetAllSystemSettingsRequest:
                this.processSharedMessageBusGetAllSystemSettings(message as BusGetAllSystemSettingsRequestMessage);
                break;
        }
    }

    async processSharedMessageBusUpdateSystemSettingsValues(message: BusUpdateSystemSettingsValuesRequestMessage): Promise<void> {
        const replyMsg = createBusUpdateSystemSettingsValuesReplyMessage();
        try {
            const validateResult = new SystemSettingsValidator().validateNameWithValues(message.body.systemSettingsNameWithValues);
            if (validateResult.failed) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: validateResult.errorCode as string,
                    description: validateResult.errorMessage,
                }];
                this.publishToSharedChannel(replyMsg, message);
                return;
            }
            await this.storageProvider.updateSystemSettingsValues(message.body.systemSettingsNameWithValues);
            // After update, load the settings again and apply them so they have immediate effect
            const storageSystemSettings = await this.loadSystemSettings();
            this.applySystemSettings();
            this.publishToSharedChannel(replyMsg, message);
            // Also publish notification message so other services know about the new settings
            const notificationMsg = createBusAllSystemSettingsNotificationMessage();
            notificationMsg.body.systemSettings = storageSystemSettings.map(x => this.entityConverter.toSystemSetting(x));
            this.publishNotificationMessageToSharedChannel(notificationMsg);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToSharedChannel(replyMsg, message);
        }
    }

    async processSharedMessageBusGetAllSystemSettings(message: BusGetAllSystemSettingsRequestMessage): Promise<void> {
        const replyMsg = createBusGetAllSystemSettingsReplyMessage();
        try {
            const storageAllSystemSettings = await this.storageProvider.getAllSystemSettings();
            replyMsg.body.systemSettings = storageAllSystemSettings.map(x => this.entityConverter.toSystemSetting(x));
            this.publishToSharedChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToSharedChannel(replyMsg, message);
        }
    }

    processOperatorsChannelMessage<TBody>(message: Message<TBody>): void {
        const type = message.header?.type;
        switch (type) {
            case MessageType.busGetAllAllowedDeviceObjectsRequest:
                this.processBusGetAllAllowedDeviceObjectsRequestMessage(message as BusGetAllAllowedDeviceObjectsRequestMessage);
                break;
            case MessageType.busUpdateDeviceGroupRequest:
                this.processBusUpdateDeviceGroupRequestMessage(message as BusUpdateDeviceGroupRequestMessage);
                break;
            case MessageType.busCreateDeviceGroupRequest:
                this.processBusCreateDeviceGroupRequestMessage(message as BusCreateDeviceGroupRequestMessage);
                break;
            case MessageType.busGetDeviceGroupDataRequest:
                this.processBusGetDeviceGroupDataRequestMessage(message as BusGetDeviceGroupDataRequestMessage);
                break;
            case MessageType.busGetAllDeviceGroupsRequest:
                this.processBusGetAllDeviceGroupsRequestMessage(message as BusGetAllDeviceGroupsRequestMessage);
                break;
            case MessageType.busUpdateProfileSettingsRequest:
                this.processBusUpdateProfileSettingsRequestMessage(message as BusUpdateProfileSettingsRequestMessage);
                break;
            case MessageType.busGetProfileSettingsRequest:
                this.processBusGetProfileSettingsRequestMessage(message as BusGetProfileSettingsRequestMessage);
                break;
            case MessageType.busChangePasswordRequest:
                this.processBusChangePasswordRequestMessage(message as BusChangePasswordRequestMessage);
                break;
            case MessageType.busCreateDeviceRequest:
                this.processBusCreateDeviceRequestMessage(message as BusCreateDeviceRequestMessage);
                break;
            case MessageType.busGetShiftsRequest:
                this.processBusGetShiftsRequestMessage(message as BusGetShiftsRequestMessage);
                break;
            case MessageType.busCompleteShiftRequest:
                this.processBusCompleteShiftRequestMessage(message as BusCompleteShiftRequestMessage);
                break;
            case MessageType.busGetCurrentShiftStatusRequest:
                this.processBusGetCurrentShiftStatusRequestMessage(message as BusGetCurrentShiftStatusRequestMessage);
                break;
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
            case MessageType.busCreatePrepaidTariffRequest:
                this.processBusCreatePrepaidTariffRequestMessage(message as BusCreatePrepaidTariffRequestMessage);
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
            case MessageType.busChangePrepaidTariffPasswordByCustomerRequest:
                this.processBusChangePrepaidTariffPasswordByCustomerRequestMessage(message as BusChangePrepaidTariffPasswordByCustomerRequestMessage);
                break;
            case MessageType.busEndDeviceSessionByCustomerRequest:
                this.processBusEndDeviceSessionByCustomerRequestMessage(message as BusEndDeviceSessionByCustomerRequestMessage);
                break;
            case MessageType.busStartDeviceOnPrepaidTariffByCustomerRequest:
                this.processBusStartDeviceOnPrepaidTariffByCustomerRequestMessage(message as BusStartDeviceOnPrepaidTariffByCustomerRequestMessage);
                break;
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

    compareShiftStatuses(left: ShiftStatus, right: ShiftStatus): boolean {
        if (!left || !right) {
            return false;
        }
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        if (leftKeys.length !== rightKeys.length) {
            return false;
        }
        const getObjectValue = (obj: unknown, key: string) => (obj as any)[key];
        for (const key of leftKeys) {
            const leftValue = getObjectValue(left, key);
            const rightValue = getObjectValue(right, key);
            if (leftValue !== rightValue) {
                return false;
            }
        }

        return true;
    }

    async processBusGetAllAllowedDeviceObjectsRequestMessage(message: BusGetAllAllowedDeviceObjectsRequestMessage): Promise<void> {
        const replyMsg = createBusGetAllAllowedDeviceObjectsReplyMessage();
        try {
            const allowedDeviceObjects: AllowedDeviceObjects[] = [];
            const allDevices = await this.getOrCacheAllDevices();
            const allTariffs = await this.getOrCacheAllTariffs();
            const enabledTariffIdsSet = new Set<number>(allTariffs.filter(x => x.enabled).map(x => x.id));
            const disabledTariffIdsSet = new Set<number>(allTariffs.filter(x => !x.enabled).map(x => x.id));
            const storageAllDeviceGroups = await this.storageProvider.getAllDeviceGroups();
            const storageDeviceGroupsMap = new Map<number, IDeviceGroup>(storageAllDeviceGroups.map(x => ([x.id, x])));
            const storageAllTariffsInDeviceGroups = await this.storageProvider.getAllTariffsInDeviceGroups();
            for (const device of allDevices) {
                const allowedDeviceObjectsItem: AllowedDeviceObjects = {
                    deviceId: device.id,
                    allowedTariffIds: this.getAllowedDeviceTariffIds(
                        device.deviceGroupId,
                        storageAllTariffsInDeviceGroups,
                        enabledTariffIdsSet,
                        disabledTariffIdsSet,
                    ),
                    allowedTransferTargetDeviceIds: this.getAllowedDeviceTransferTargetDeviceIds(
                        device,
                        storageDeviceGroupsMap,
                        allDevices,
                    ),
                };
                allowedDeviceObjects.push(allowedDeviceObjectsItem);
            }
            replyMsg.body.allowedDeviceObjects = allowedDeviceObjects;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    private getAllowedDeviceTariffIds(
        deviceGroupId: number | undefined | null,
        storageTariffsInDeviceGroups: ITariffInDeviceGroup[],
        enabledTariffIdsSet: Set<number>,
        disabledTariffIdsSet: Set<number>,
    ): number[] {
        if (!deviceGroupId) {
            // Device which is not in a group should be able to use all enabled tariffs
            return [...enabledTariffIdsSet];
        }
        const tariffIdsSet = new Set<number>(storageTariffsInDeviceGroups.filter(x => x.device_group_id === deviceGroupId).map(x => x.tariff_id));
        // Exclude disabled tariffs from tariffs in the device group
        for (const item of disabledTariffIdsSet) {
            tariffIdsSet.delete(item);
        }
        return [...tariffIdsSet];
    }

    /**
     * TODO: Requires refactoring to simplify it
     * @param device 
     * @param storageDeviceGroupsMap 
     * @param storageTariffsInDeviceGroups 
     * @param allTariffs 
     * @param allDevices 
     * @returns 
     */
    private getAllowedDeviceTransferTargetDeviceIds(
        device: Device,
        storageDeviceGroupsMap: Map<number, IDeviceGroup>,
        allDevices: Device[],
    ): number[] {
        if (device.disableTransfer) {
            // Device transfer is disabled - allowed target devices must be empty array
            return [];
        }

        const enabledAndTransferrableDevices = allDevices.filter(x => x.approved && x.enabled && !x.disableTransfer && x.id !== device.id);
        const getTransferTargetDeviceIds = (
            device: Device,
            enabledAndTransferrableDevices: Device[],
            storageDeviceGroupsMap: Map<number, IDeviceGroup>,
        ): number[] => {
            if (device.disableTransfer) {
                return [];
            }

            const allowedTargetDeviceIdsSet = new Set<number>();
            if (device.deviceGroupId) {
                // The device is in a group
                const deviceGroup = storageDeviceGroupsMap.get(device.deviceGroupId);
                if (deviceGroup?.restrict_device_transfers) {
                    // The device is in a group, which restricts transfer
                    // Add only devices in this group as transfer targets
                    const deviceGroupDevices = enabledAndTransferrableDevices.filter(x => x.deviceGroupId === deviceGroup.id);
                    const idsSet = new Set<number>(deviceGroupDevices.map(x => x.id));
                    return [...idsSet];
                }

                for (const device of enabledAndTransferrableDevices) {
                    if (device.deviceGroupId) {
                        // The target device is in group - check if the group restricts device transfers
                        const deviceGroup = storageDeviceGroupsMap.get(device.deviceGroupId);
                        if (!deviceGroup?.restrict_device_transfers) {
                            // The target device group does not restrict device transfers
                            // It can be used for transfer target
                            // TODO: It is possible that the source group and target groups have different
                            //       tariffs and then the transfer should be possible only if the device
                            //       is started for tariff which is part of the target device group
                            //       But also if the device has continuation, it should also be part of the target group tariffs
                            //       Such logic becomes complex and for now we will allow such transfers
                            //       event if the target device is in a group, that doesn't have source device tariff / continuation tariff
                            allowedTargetDeviceIdsSet.add(device.id);
                        }
                    } else {
                        // The target device is not in a group - add it to possible transfer targets
                        allowedTargetDeviceIdsSet.add(device.id);
                    }
                }
            } else {
                // The device is not in a group
                // Find other devices which are not in group
                const devicesNotInGroup = enabledAndTransferrableDevices.filter(x => !x.deviceGroupId);
                devicesNotInGroup.map(x => x.id).forEach(x => allowedTargetDeviceIdsSet.add(x));
                // Add devices which are in groups which do not restrict transfer
                const groupsWithoutTransferRestriction: IDeviceGroup[] = [];
                storageDeviceGroupsMap.values().forEach(x => {
                    if (!x.restrict_device_transfers) {
                        groupsWithoutTransferRestriction.push(x);
                    }
                });
                for (const noRestrictionGroup of groupsWithoutTransferRestriction) {
                    const groupId = noRestrictionGroup.id;
                    const devices = enabledAndTransferrableDevices.filter(x => x.deviceGroupId === groupId);
                    const deviceGroupDeviceIds = devices.map(x => x.id);
                    deviceGroupDeviceIds.forEach(x => allowedTargetDeviceIdsSet.add(x));
                }
            }
            const result = [...allowedTargetDeviceIdsSet];
            return result;
        };

        let allowedDeviceTransferTargetDeviceIds: number[] = [];
        // Determine whether the device can be transferred and to which other devices
        if (device.deviceGroupId) {
            // The device is in a group
            // Check if device group restricts transfer
            const deviceGroup = storageDeviceGroupsMap.get(device.deviceGroupId)!;
            if (deviceGroup.restrict_device_transfers) {
                // The group restricts transferring device only to other devices in the same group
                // Get all device ids in this group
                const deviceIdsInDeviceGroupSet = new Set<number>(enabledAndTransferrableDevices.filter(x => x.deviceGroupId === device.deviceGroupId).map(x => x.id));
                // Remove the current device id from the list
                deviceIdsInDeviceGroupSet.delete(device.id);
                // Set it to allowed devices ids for transfer
                allowedDeviceTransferTargetDeviceIds = [...deviceIdsInDeviceGroupSet];
            } else {
                // The device group does not restrict transfers
                // Allow the device to be transferred to
                // other device if it does not restrict its transfer either directly or by its group (if in a group)
                allowedDeviceTransferTargetDeviceIds = getTransferTargetDeviceIds(
                    device,
                    enabledAndTransferrableDevices,
                    storageDeviceGroupsMap,
                );
            }
        } else if (!device.deviceGroupId) {
            // The device is not in a group
            // It could be transferred to other devices which are not in group or to devices in a group
            // which does not restrict transfers
            allowedDeviceTransferTargetDeviceIds = getTransferTargetDeviceIds(
                device,
                enabledAndTransferrableDevices,
                storageDeviceGroupsMap,
            );
        }
        return allowedDeviceTransferTargetDeviceIds;
    }

    async processBusUpdateDeviceGroupRequestMessage(message: BusUpdateDeviceGroupRequestMessage): Promise<void> {
        const replyMsg = createBusUpdateDeviceGroupReplyMessage();
        try {
            const deviceGroup: DeviceGroup = message.body.deviceGroup;
            if (!deviceGroup) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceGroupIsRequired,
                    description: 'Device group is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!deviceGroup.id) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceGroupIdIsRequired,
                    description: 'Device group ID is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            // TODO: Currently device groups are always enabled - we could remove this flag later if it does not make sense
            deviceGroup.enabled = true;
            const storageDeviceGroupToCreate = this.entityConverter.toStorageDeviceGroup(deviceGroup);
            const createdStorageDeviceGroup = await this.storageProvider.updateDeviceGroup(storageDeviceGroupToCreate, message.body.assignedTariffIds);
            if (!createdStorageDeviceGroup) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.cantCreateDeviceGroup,
                    description: `Can't create device group`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            replyMsg.body.deviceGroup = this.entityConverter.toDeviceGroup(createdStorageDeviceGroup);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusCreateDeviceGroupRequestMessage(message: BusCreateDeviceGroupRequestMessage): Promise<void> {
        const replyMsg = createBusCreateDeviceGroupReplyMessage();
        try {
            const deviceGroup: DeviceGroup = message.body.deviceGroup;
            if (!deviceGroup) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceGroupIsRequired,
                    description: 'Device group is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            // TODO: Currently device groups are always enabled - we could remove this flag later if it does not make sense
            deviceGroup.enabled = true;
            const storageDeviceGroupToCreate = this.entityConverter.toStorageDeviceGroup(deviceGroup);
            const createdStorageDeviceGroup = await this.storageProvider.createDeviceGroup(storageDeviceGroupToCreate, message.body.assignedTariffIds);
            if (!createdStorageDeviceGroup) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.cantCreateDeviceGroup,
                    description: `Can't create device group`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            replyMsg.body.deviceGroup = this.entityConverter.toDeviceGroup(createdStorageDeviceGroup);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetDeviceGroupDataRequestMessage(message: BusGetDeviceGroupDataRequestMessage): Promise<void> {
        const replyMsg = createBusGetDeviceGroupDataReplyMessage();
        const deviceGroupData: DeviceGroupData = {} as DeviceGroupData;
        try {
            if (!(message.body.deviceGroupId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceGroupIdIsRequired,
                    description: 'Device group ID is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const storageDeviceGroup = await this.storageProvider.getDeviceGroup(message.body.deviceGroupId);
            if (!storageDeviceGroup) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceGroupNotFound,
                    description: `Device group with ID ${message.body.deviceGroupId} was not found`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            deviceGroupData.deviceGroup = this.entityConverter.toDeviceGroup(storageDeviceGroup);
            deviceGroupData.assignedTariffIds = await this.storageProvider.getAllTariffIdsInDeviceGroup(message.body.deviceGroupId);
            deviceGroupData.assignedDeviceIds = await this.storageProvider.getAllDeviceIdsInDeviceGroup(message.body.deviceGroupId);
            replyMsg.body.deviceGroupData = deviceGroupData;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetAllDeviceGroupsRequestMessage(message: BusGetAllDeviceGroupsRequestMessage): Promise<void> {
        const replyMsg = createBusGetAllDeviceGroupsReplyMessage();
        try {
            const storageDeviceGroups = await this.storageProvider.getAllDeviceGroups();
            replyMsg.body.deviceGroups = storageDeviceGroups.map(x => this.entityConverter.toDeviceGroup(x));
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusUpdateProfileSettingsRequestMessage(message: BusUpdateProfileSettingsRequestMessage): Promise<void> {
        const replyMsg = createBusUpdateProfileSettingsReplyMessage();
        try {
            if (!(message.body.userId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: 'User ID is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const profileSettings: UserProfileSettingWithValue[] = message.body.profileSettings;
            const hasEmptyName = profileSettings.some(x => this.isWhiteSpace(x.name));
            if (hasEmptyName) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.nameCannotBeEmpty,
                    description: 'Name cannot be empty',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const storeSettings = profileSettings.map(x => ({ setting_name: x.name, setting_value: x.value } as IUserProfileSettingWithValue));
            await this.storageProvider.updateUserProfileSettings(message.body.userId, storeSettings);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }


    async processBusGetProfileSettingsRequestMessage(message: BusGetProfileSettingsRequestMessage): Promise<void> {
        const replyMsg = createBusGetProfileSettingsReplyMessage();
        try {
            if (!(message.body.userId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: 'User ID is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const storageProfileSettingWithValues = await this.storageProvider.getUserProfileSettingWithValues(message.body.userId);
            const profileSettings: UserProfileSettingWithValue[] = storageProfileSettingWithValues.map(x => ({
                name: x.setting_name,
                value: x.setting_value,
            } as UserProfileSettingWithValue));
            const allProfileSettings = await this.storageProvider.getAllUserProfileSettings();
            for (const profileSetting of allProfileSettings) {
                const existingSetting = profileSettings.find(x => x.name === profileSetting.name);
                if (existingSetting) {
                    // The setting is created for this user profile - set its description
                    existingSetting.description = profileSetting.description;
                } else {
                    // The setting is not yet created for this user profile - add it to the result
                    profileSettings.push({
                        name: profileSetting.name,
                        description: profileSetting.description,
                    });
                }
            }
            const storageUser = await this.storageProvider.getUserById(message.body.userId);
            replyMsg.body.settings = profileSettings;
            replyMsg.body.username = storageUser!.username;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusChangePasswordRequestMessage(message: BusChangePasswordRequestMessage): Promise<void> {
        const replyMsg = createBusChangePasswordReplyMessage();
        try {
            if (!(message.body.userId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: 'User ID is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!message.body.currentPasswordHash
                || !message.body.newPasswordHash
                || message.body.currentPasswordHash.length !== 128
                || message.body.newPasswordHash.length !== 128
            ) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.invalidPasswordHash,
                    description: 'Password hash is invalid',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const res = await this.storageProvider.changePassword(message.body.userId, message.body.currentPasswordHash, message.body.newPasswordHash);
            if (!res) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.passwordDoesNotMatch,
                    description: 'Specified current password does not match',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusCreateDeviceRequestMessage(message: BusCreateDeviceRequestMessage): Promise<void> {
        const replyMsg = createBusCreateDeviceReplyMessage();
        try {
            const device: Device = message.body.device;
            if (!device?.ipAddress) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIpAddressIsRequired,
                    description: 'Device IP address is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (this.isWhiteSpace(device.certificateThumbprint)) {
                // Empty / whitespace strings for certificateThumbprint will be treated as nulls
                // to allow creating more than one device with no certificateThumbprint
                // because it is constrained to be unique allowing only nulls to be more than one
                device.certificateThumbprint = null;
            }
            device.createdAt = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const storageDeviceToCreate = this.entityConverter.toStorageDevice(device);
            const createdStorageDevice = await this.storageProvider.createDevice(storageDeviceToCreate);
            const storageDeviceStatus: IDeviceStatus = {
                device_id: createdStorageDevice.id,
                enabled: false,
                start_reason: null,
                started: false,
                started_at: null,
                stopped_at: null,
                total: null,
            }
            // Create record in device statuses database table
            await this.storageProvider.addOrUpdateDeviceStatusEnabled(storageDeviceStatus);
            this.logger.log('New device created. Device Id', createdStorageDevice.id);
            await this.cacheAllDevices();
            const createdDevice = this.entityConverter.toDevice(createdStorageDevice);
            replyMsg.body.device = createdDevice;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetShiftsRequestMessage(message: BusGetShiftsRequestMessage): Promise<void> {
        const replyMsg = createBusGetShiftsReplyMessage();
        try {
            const fromDate = this.dateTimeHelper.convertToUTC(message.body.fromDate);
            if (!fromDate) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.invalidDate,
                    description: `Specified date '${message.body.fromDate}' is invalid. Must be string in ISO 8601 format`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const toDate = this.dateTimeHelper.convertToUTC(message.body.toDate);
            if (!toDate) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.invalidDate,
                    description: `Specified date '${message.body.toDate}' is invalid. Must be string in ISO8601 format`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            // TODO: Combine getShifts and getShiftsSummary in single transaction in the storage provider
            const storageShifts = await this.storageProvider.getShifts(fromDate, toDate, message.body.userId);
            const shifts = storageShifts.map(x => this.entityConverter.toShift(x));
            replyMsg.body.shifts = shifts;
            const storageShiftsSummary = await this.storageProvider.getShiftsSummary(fromDate, toDate, message.body.userId);
            replyMsg.body.shiftsSummary = this.entityConverter.toShiftsSummary(storageShiftsSummary);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusCompleteShiftRequestMessage(message: BusCompleteShiftRequestMessage): Promise<void> {
        const replyMsg = createBusCompleteShiftReplyMessage();
        try {
            if (!(message.body.userId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: 'User Id is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const shiftStatus = await this.getShiftStatus();
            const areShiftStatusesEqual = this.compareShiftStatuses(shiftStatus, message.body.shiftStatus);
            if (!areShiftStatusesEqual) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.shiftStatusesDoesNotMatch,
                    description: 'Provided shift status does not match with current shift status',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const storageShiftToAdd: IShift = {
                completed_at: this.dateTimeHelper.getCurrentUTCDateTimeAsISOString(),
                completed_sessions_count: shiftStatus.completedSessionsCount,
                completed_sessions_total: shiftStatus.completedSessionsTotal,
                continuations_count: shiftStatus.continuationsCount,
                continuations_total: shiftStatus.continuationsTotal,
                running_sessions_count: shiftStatus.runningSessionsCount,
                running_sessions_total: shiftStatus.runningSessionsTotal,
                created_prepaid_tariffs_count: shiftStatus.createdPrepaidTariffsCount,
                created_prepaid_tariffs_total: shiftStatus.createdPrepaidTariffsTotal,
                recharged_prepaid_tariffs_count: shiftStatus.rechargedPrepaidTariffsCount,
                recharged_prepaid_tariffs_total: shiftStatus.rechargedPrepaidTariffsTotal,
                total_amount: shiftStatus.totalAmount,
                user_id: message.body.userId,
                note: message.body.note,
            } as IShift;
            const addedStorageShift = await this.storageProvider.addShift(storageShiftToAdd);
            if (!addedStorageShift) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.cannotCompleteShift,
                    description: 'Cannot complete the shift',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const shift = this.entityConverter.toShift(addedStorageShift);
            replyMsg.body.shift = shift;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusCompleteShiftRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async getShiftStatus(): Promise<ShiftStatus> {
        const allTariffs = await this.getOrCacheAllTariffs();
        const nowISOString = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();

        // Get last shift to know from which date-time to calculate current shift
        const storageLastShift = await this.storageProvider.getLastShift();
        const fromDate = storageLastShift?.completed_at;
        // Completed device sessions since when the last shift was cmpleted
        const storageCompletedSessionsSummary = await this.storageProvider.getCompletedSessionsSummary(fromDate, nowISOString);
        // If there are no completed sessions, the count will be 0 but total is null - change it to 0 in this case
        storageCompletedSessionsSummary.total ||= 0;

        // Created prepaid tariffs
        const storageCreatedTariffs = await this.storageProvider.getCreatedTariffsForDateTimeInterval(fromDate, nowISOString);
        const storageCreatedPrepaidTariffs = storageCreatedTariffs.filter(x => this.isPrepaidType(x.type as number as TariffType));
        let createdPrepaidTariffsCount = storageCreatedPrepaidTariffs.length;
        let createdPrepaidTariffsTotal = storageCreatedPrepaidTariffs.reduce((prevValue, tariff) => prevValue + tariff.price, 0);

        // Recharged tariffs
        const storageRechargedTariffs = await this.storageProvider.getRechargedTariffsForDateTimeInterval(fromDate, nowISOString);
        let rechargedPrepaidTariffsCount = storageRechargedTariffs.length;
        let rechargedPrepaidTariffsTotal = storageRechargedTariffs.reduce((prevValue, tariff) => prevValue + tariff.recharge_price, 0);

        // Current started device statuses with continuations started for non-prepaid tariff
        const storageAllDeviceStatusesWithContinuation = await this.storageProvider.getAllDeviceStatusesWithContinuationData();
        const storageStartedDeviceStatuses = storageAllDeviceStatusesWithContinuation.filter(x => x.started);
        const nonPrepaidTariffsIdsSet = new Set<number>(allTariffs.filter(x => !this.isPrepaidType(x.type)).map(x => x.id));
        const storageStartedDeviceStatusesForNonPrepaidTariffs = storageStartedDeviceStatuses.filter(x => nonPrepaidTariffsIdsSet.has(x.start_reason!));
        // Running sessions count will include started device on all tariffs
        // while the running sessions total will include only devices started for non-prepaid tariffs
        let runningSessionsCount = storageStartedDeviceStatuses.length;
        let runningSessionsTotal = 0;
        let continuationsCount = 0;
        let continuationsTotal = 0;
        for (const startedDevice of storageStartedDeviceStatusesForNonPrepaidTariffs) {
            const tariff = allTariffs.find(x => x.id === startedDevice.start_reason)!;
            runningSessionsTotal += tariff.price;
            if (startedDevice.continuation_tariff_id) {
                const continuationTariff = allTariffs.find(x => x.id === startedDevice.continuation_tariff_id)!;
                continuationsTotal += continuationTariff.price;
                continuationsCount++;
            }
        }

        const totalAmount = storageCompletedSessionsSummary.total
            + continuationsTotal
            + runningSessionsTotal
            + createdPrepaidTariffsTotal
            + rechargedPrepaidTariffsTotal;
        const totalCount = storageCompletedSessionsSummary.count
            + continuationsCount
            + runningSessionsCount
            + createdPrepaidTariffsCount
            + rechargedPrepaidTariffsCount;
        const shiftStatus: ShiftStatus = {
            completedSessionsCount: storageCompletedSessionsSummary.count,
            completedSessionsTotal: storageCompletedSessionsSummary.total,
            continuationsCount: continuationsCount,
            continuationsTotal: continuationsTotal,
            runningSessionsCount: runningSessionsCount,
            runningSessionsTotal: runningSessionsTotal,
            createdPrepaidTariffsCount: createdPrepaidTariffsCount,
            createdPrepaidTariffsTotal: createdPrepaidTariffsTotal,
            rechargedPrepaidTariffsCount: rechargedPrepaidTariffsCount,
            rechargedPrepaidTariffsTotal: rechargedPrepaidTariffsTotal,
            totalAmount: totalAmount,
            totalCount: totalCount,
        };
        return shiftStatus;
    }

    async processBusGetCurrentShiftStatusRequestMessage(message: BusGetCurrentShiftStatusRequestMessage): Promise<void> {
        const replyMsg = createBusGetCurrentShiftStatusReplyMessage();
        try {
            const shiftStatus = await this.getShiftStatus();
            replyMsg.body.shiftStatus = shiftStatus;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetCurrentShiftStatusRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusChangePrepaidTariffPasswordByCustomerRequestMessage(message: BusChangePrepaidTariffPasswordByCustomerRequestMessage): Promise<void> {
        const replyMsg = createBusChangePrepaidTariffPasswordByCustomerReplyMessage();
        try {
            // TODO: Refactor validation - extract it in another file
            const deviceId = message.body.deviceId;
            if (!deviceId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIdIsRequired,
                    description: 'Device Id is required',
                }];
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            if (this.isWhiteSpace(message.body.currentPasswordHash)
                || this.isWhiteSpace(message.body.newPasswordHash)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.passwordHashIsRequired,
                    description: 'Current and new passwords are required',
                }];
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            const allDevices = await this.getOrCacheAllDevices();
            const device = allDevices.find(x => x.id === deviceId);
            if (!device) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceNotFound,
                    description: `Specified device with Id ${deviceId} is not found`,
                }];
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            if (!(device.approved && device.enabled)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIsNotActive,
                    description: `Specified device with Id ${deviceId} is not active`,
                }];
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            const storageDeviceStatus = await this.storageProvider.getDeviceStatus(deviceId);
            if (!storageDeviceStatus) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceNotFound,
                    description: `Specified device with Id ${deviceId} is not found`,
                }];
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            const allTariffs = await this.getOrCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === storageDeviceStatus.start_reason);
            if (!tariff) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffNotFound,
                    description: `Specified device with Id ${deviceId} is not found`,
                }];
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            if (!this.isPrepaidType(tariff.type)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIsNotPrepaidType,
                    description: `Specified tariff Id ${tariff.id} (${tariff.name}) is not of prepaid type`,
                }];
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            const checkTariffPasswordHash = await this.storageProvider.checkTariffPasswordHash(tariff.id, message.body.currentPasswordHash);
            if (!checkTariffPasswordHash) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.passwordDoesNotMatch,
                    description: `Specified current password does not match`,
                }];
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            const updatedTariff = await this.storageProvider.updateTariffPasswordHash(tariff.id, message.body.newPasswordHash);
            this.publishToDevicesChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusChangePrepaidTariffPasswordByCustomerRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToDevicesChannel(replyMsg, message);
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
            if (!(message.body.userId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: 'User Id is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const allTariffs = await this.getOrCacheAllTariffs();
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
            if (!this.isPrepaidType(tariff.type)) {
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
            replyMsg.body.tariff = this.entityConverter.toTariff(increaseResult.tariff);
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
            const allDevices = await this.getOrCacheAllDevices();
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
            const allTariffs = await this.getOrCacheAllTariffs();
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

            const isTariffAvailable = await this.isTariffAvailableForDevice(
                deviceContinuation.deviceId,
                deviceContinuation.tariffId,
                allTariffs,
            );
            if (!isTariffAvailable) {
                const replyMsg = createBusStartDeviceReplyMessage();
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIsNotAvailable,
                    description: `The tariff Id ${tariff.id} ('${tariff.name}') is not available for the device`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }

            const storageDeviceContinuation = this.entityConverter.toStorageDeviceContinuation(deviceContinuation);
            storageDeviceContinuation.requestedAt = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdDeviceContinuation = await this.storageProvider.createDeviceContinuation(storageDeviceContinuation);
            const replyDeviceContinuation = this.entityConverter.toDeviceContinuation(createdDeviceContinuation);
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
            const allEnabledDevices = (await this.getOrCacheAllDevices()).filter(x => x.approved && x.enabled);
            const sourceDevice = allEnabledDevices.find(x => x.id === sourceDeviceId);
            if (!sourceDevice) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceNotFound,
                    description: `Source device with Id ${sourceDeviceId} not found`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!!sourceDevice.disableTransfer) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIsNotTransferrable,
                    description: `Source device with Id ${sourceDeviceId} is not transferrable`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const targetDevice = allEnabledDevices.find(x => x.id === targetDeviceId);
            if (!targetDevice) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceNotFound,
                    description: `Target device with Id ${targetDeviceId} not found`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!!targetDevice.disableTransfer) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIsNotTransferrable,
                    description: `Target device with Id ${targetDevice} is not transferrable`,
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
            // Check if source device can be transfered to target device checking device groups
            // TODO: Cache device groups
            const storageAllDeviceGroups = await this.storageProvider.getAllDeviceGroups();
            const storageDeviceGroupsMap = new Map<number, IDeviceGroup>(storageAllDeviceGroups.map(x => ([x.id, x])));
            const availableTargetDeviceIds = this.getAllowedDeviceTransferTargetDeviceIds(
                sourceDevice,
                storageDeviceGroupsMap,
                allEnabledDevices,
            );
            if (!availableTargetDeviceIds.includes(targetDeviceId)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.targetDeviceIsNotAvailableForTransfer,
                    description: `Target device with Id ${targetDeviceId} is not available for transfer`,
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
            replyMsg.body.sourceDeviceStatus = this.entityConverter.toDeviceStatus(transferDeviceResult.sourceDeviceStatus);
            replyMsg.body.targetDeviceStatus = this.entityConverter.toDeviceStatus(transferDeviceResult.targetDeviceStatus);
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

    async processBusEndDeviceSessionByCustomerRequestMessage(message: BusEndDeviceSessionByCustomerRequestMessage): Promise<void> {
        const replyMsg = createBusEndDeviceSessionByCustomerReplyMessage();
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
            const storageDeviceStatus = await this.storageProvider.getDeviceStatus(deviceId);
            if (!storageDeviceStatus) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceNotFound,
                    description: `Device with Id ${deviceId} is not found`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!storageDeviceStatus.started) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIsNotStarted,
                    description: `Device with Id ${deviceId} is not started`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const allTariffs = await this.getOrCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === storageDeviceStatus.start_reason)!;
            if (!this.isPrepaidType(tariff.type)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIsNotPrepaidType,
                    description: `Device with Id ${deviceId} is not started for prepaid tariff`,
                }] as MessageError[];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }

            const diffMs = this.dateTimeHelper.getCurrentDateTimeAsNumber() - this.dateTimeHelper.getNumberFromISOStringDateTime(storageDeviceStatus.started_at)!;
            // totalTime must be in seconds
            const totalTime = Math.ceil(diffMs / 1000);
            storageDeviceStatus.started = false;
            storageDeviceStatus.stopped_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            storageDeviceStatus.stopped_by_user_id = null;
            // const deviceStatus = this.createDeviceStatusFromStorageDeviceStatus(storageDeviceStatus);
            // totalTime must be in seconds
            // deviceStatus.totalTime = totalTime;
            const storageDeviceSession: IDeviceSession = {
                device_id: storageDeviceStatus.device_id,
                started_at: storageDeviceStatus.started_at,
                stopped_at: storageDeviceStatus.stopped_at,
                tariff_id: storageDeviceStatus.start_reason,
                // Prepaid tariffs set total amount to 0, because they are already paid
                total_amount: 0,
                started_by_user_id: storageDeviceStatus.started_by_user_id,
                stopped_by_user_id: storageDeviceStatus.stopped_by_user_id,
                started_by_customer: !storageDeviceStatus.started_by_user_id,
                stopped_by_customer: true,
            } as IDeviceSession;

            const updatedStorageTariff = await this.decreaseTariffRemainingSeconds(tariff.id, tariff.remainingSeconds!, totalTime);
            if (!updatedStorageTariff) {
                throw new Error(`Can't decrease tariff remaining seconds`);
            }
            const completeDeviceStatusUpdateResult = await this.storageProvider.completeDeviceStatusUpdate(storageDeviceStatus, storageDeviceSession);
            if (!completeDeviceStatusUpdateResult) {
                throw new Error(`Can't stop the device`);
            }
            await this.refreshDeviceStatuses();
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusEndDeviceSessionByCustomerRequestMessage message`, message, err);
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
            const allTariffs = await this.getOrCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === deviceStatus.tariff)!;
            let totalAmount = storageDeviceStatus.total;
            if (this.isPrepaidType(tariff.type)) {
                totalAmount = 0;
            } else {
                totalAmount = this.getTotalSumCalculatingStartFreeTime(tariff, deviceStatus.totalTime);
            }
            deviceStatus.totalSum = totalAmount;
            const storageDeviceSession: IDeviceSession = {
                device_id: storageDeviceStatus.device_id,
                started_at: storageDeviceStatus.started_at,
                stopped_at: storageDeviceStatus.stopped_at,
                tariff_id: storageDeviceStatus.start_reason,
                total_amount: totalAmount,
                started_by_user_id: storageDeviceStatus.started_by_user_id,
                stopped_by_user_id: storageDeviceStatus.stopped_by_user_id,
                started_by_customer: !storageDeviceStatus.started_by_user_id,
                stopped_by_customer: !!message.body.stoppedByCustomer,
                note: message.body.note,
            } as IDeviceSession;
            if (this.isPrepaidType(tariff?.type)) {
                const updatedStorageTariff = await this.decreaseTariffRemainingSeconds(tariff.id, tariff.remainingSeconds!, totalTime);
                if (!updatedStorageTariff) {
                    throw new Error(`Can't decrease tariff remaining seconds`);
                }
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
            const storageUser = this.entityConverter.toStorageUser(user);
            storageUser.updated_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdStorageUser = await this.storageProvider.updateUserWithRoles(storageUser, message.body.roleIds || [], message.body.passwordHash);
            if (createdStorageUser) {
                replyMsg.body.user = this.entityConverter.toUSer(createdStorageUser);
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
            replyMsg.body.user = this.entityConverter.toUSer(storageUser);
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
            const storageUser = this.entityConverter.toStorageUser(user);
            storageUser.created_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdStorageUser = await this.storageProvider.createUserWithRoles(storageUser, message.body.passwordHash, message.body.roleIds || []);
            if (createdStorageUser) {
                replyMsg.body.user = this.entityConverter.toUSer(createdStorageUser);
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
            const allUsers = allStorageUsers.map(x => this.entityConverter.toUSer(x))
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
            const storageRole = this.entityConverter.toStorageRole(role);
            const updatedStorageRole = await this.storageProvider.updateRoleWithPermissions(storageRole, message.body.permissionIds || []);
            if (updatedStorageRole) {
                replyMsg.body.role = this.entityConverter.toRole(updatedStorageRole);
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
            const storageRole = this.entityConverter.toStorageRole(role);
            const createdStorageRole = await this.storageProvider.createRoleWithPermissions(storageRole, message.body.permissionIds || []);
            if (createdStorageRole) {
                replyMsg.body.role = this.entityConverter.toRole(createdStorageRole);
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
            replyMsg.body.role = this.entityConverter.toRole(storageRole);
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
            const allRoles = allStorageRoles.map(storageTole => this.entityConverter.toRole(storageTole));
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

    async processBusStartDeviceOnPrepaidTariffByCustomerRequestMessage(message: BusStartDeviceOnPrepaidTariffByCustomerRequestMessage): Promise<void> {
        try {
            const replyMsg = createBusStartDeviceOnPrepaidTariffByCustomerReplyMessage();
            if (!message.body.deviceId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.deviceIdIsRequired, description: 'Device Id is required' },
                ];
                replyMsg.body.notAllowed = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            const passwordMatches = await this.storageProvider.checkTariffPasswordHash(message.body.tariffId, message.body.passwordHash);
            if (!passwordMatches) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.tariffIsNotActive, description: 'Password does not match' },
                ]
                replyMsg.body.passwordDoesNotMatch = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            const currentStorageDeviceStatus = (await this.storageProvider.getDeviceStatus(message.body.deviceId))!;
            if (currentStorageDeviceStatus.started) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.deviceAlreadyStarted, description: 'Selected device is already started' },
                ];
                replyMsg.body.alreadyInUse = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            const allTariffs = await this.getOrCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === message.body.tariffId)!;
            if (!tariff) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.tariffNotFound, description: 'Selected tariff is not found' },
                ]
                replyMsg.body.notAllowed = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            if (!this.isPrepaidType(tariff.type)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.prepaidTariffIsRequired, description: 'Selected tariff is not of prepaid type' },
                ]
                replyMsg.body.notAllowed = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            if (!tariff.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.tariffIsNotActive, description: 'Selected tariff is not active' },
                ]
                replyMsg.body.notAllowed = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            const hasRemainingSeconds = !!(tariff.remainingSeconds! > 0);
            if (!hasRemainingSeconds) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.noRemainingTimeLeft, description: `The tariff '${tariff.name}' has no time remaining` },
                ]
                replyMsg.body.notAllowed = true;
                replyMsg.body.remainingSeconds = 0;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            const devicesStatusesByTariff = await this.storageProvider.getDeviceStatusesByTariffId(tariff.id);
            const firstDeviceStartedForTariff = devicesStatusesByTariff.find(x => x.started && x.start_reason === tariff.id);
            if (firstDeviceStartedForTariff) {
                // Started on another device
                const allDevices = await this.getOrCacheAllDevices();
                const device = allDevices.find(x => x.id === firstDeviceStartedForTariff.device_id);
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    {
                        code: BusErrorCode.prepaidTariffAlreadyInUse,
                        description: `The tariff Id ${tariff.id} ('${tariff.name}') is already in use by device Id ${firstDeviceStartedForTariff.device_id} '(${device?.name})'`,
                    },
                ];
                replyMsg.body.alreadyInUse = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            const isTariffAvailable = await this.isTariffAvailableForDevice(
                message.body.deviceId,
                message.body.tariffId,
                allTariffs,
            );
            if (!isTariffAvailable) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIsNotAvailable,
                    description: `The tariff Id ${tariff.id} ('${tariff.name}') is not available for the device`,
                }];
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            currentStorageDeviceStatus.enabled = true;
            currentStorageDeviceStatus.start_reason = message.body.tariffId;
            currentStorageDeviceStatus.started = true;
            currentStorageDeviceStatus.started_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            currentStorageDeviceStatus.stopped_at = null;
            currentStorageDeviceStatus.total = tariff.price;
            // It is started by customer, not by user/operator
            currentStorageDeviceStatus.started_by_user_id = null;
            await this.storageProvider.updateDeviceStatus(currentStorageDeviceStatus);
            await this.refreshDeviceStatuses();
            replyMsg.body.remainingSeconds = tariff.remainingSeconds!;
            replyMsg.body.success = true;
            this.publishToDevicesChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusStartDeviceRequestMessage message`, message, err);
            const replyMsg = createBusStartDeviceReplyMessage();
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToDevicesChannel(replyMsg, message);
        }
    }

    private async isTariffAvailableForDevice(deviceId: number, tariffId: number, allTariffs: Tariff[]): Promise<boolean> {
        const allDevices = (await this.getOrCacheAllDevices()).filter(x => x.approved && x.enabled);
        const device = allDevices.find(x => x.id === deviceId);
        const enabledTariffIdsSet = new Set<number>(allTariffs.filter(x => x.enabled).map(x => x.id));
        const disabledTariffIdsSet = new Set<number>(allTariffs.filter(x => !x.enabled).map(x => x.id));
        const storageAllTariffsInDeviceGroups = await this.storageProvider.getAllTariffsInDeviceGroups();
        const allowedDeviceTariffIds = this.getAllowedDeviceTariffIds(
            device?.deviceGroupId,
            storageAllTariffsInDeviceGroups,
            enabledTariffIdsSet,
            disabledTariffIdsSet
        );
        if (!allowedDeviceTariffIds.includes(tariffId)) {
            return false;
        }
        return true;
    }

    async processBusStartDeviceRequestMessage(message: BusStartDeviceRequestMessage): Promise<void> {
        try {
            if (!(message.body.userId > 0)) {
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
            const allTariffs = await this.getOrCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === message.body.tariffId)!;
            if (!tariff) {
                const replyMsg = createBusStartDeviceReplyMessage();
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.tariffNotFound, description: 'Selected tariff is not found' },
                ]
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            if (!tariff.enabled) {
                const replyMsg = createBusStartDeviceReplyMessage();
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.tariffIsNotActive, description: `Specified tariff is not active` },
                ]
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }

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

            if (this.isPrepaidType(tariff.type)) {
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
                const devicesStatusesByTariff = await this.storageProvider.getDeviceStatusesByTariffId(tariff.id);
                const firstDeviceStartedForTariff = devicesStatusesByTariff.find(x => x.started && x.start_reason === tariff.id);
                if (firstDeviceStartedForTariff) {
                    // Started on another device
                    const replyMsg = createBusStartDeviceReplyMessage();
                    const allDevices = await this.getOrCacheAllDevices();
                    const device = allDevices.find(x => x.id === firstDeviceStartedForTariff.device_id);
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [
                        {
                            code: BusErrorCode.prepaidTariffAlreadyInUse,
                            description: `The tariff Id ${tariff.id} ('${tariff.name}') is already in use by device Id ${firstDeviceStartedForTariff.device_id} '(${device?.name})'`,
                        },
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

            const isTariffAvailable = await this.isTariffAvailableForDevice(
                message.body.deviceId,
                message.body.tariffId,
                allTariffs,
            );
            if (!isTariffAvailable) {
                const replyMsg = createBusStartDeviceReplyMessage();
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIsNotAvailable,
                    description: `The tariff Id ${tariff.id} ('${tariff.name}') is not available for the device`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
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
            const storageTariff = this.entityConverter.toStorageTariff(tariff);
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
            replyMsg.body.tariff = this.entityConverter.toTariff(updatedTariff);
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
            const allTariffs = await this.getOrCacheAllTariffs();
            const cachedTariff = allTariffs?.find(x => x.id === message.body.tariffId);
            if (cachedTariff) {
                replyMsg.body.tariff = cachedTariff;
            } else {
                const storageTariff = await this.storageProvider.getTariffById(message.body.tariffId);
                if (storageTariff) {
                    replyMsg.body.tariff = this.entityConverter.toTariff(storageTariff);
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

    async processBusCreatePrepaidTariffRequestMessage(message: BusCreatePrepaidTariffRequestMessage): Promise<void> {
        const replyMsg = createBusCreatePrepaidTariffReplyMessage();
        try {
            const requestedTariffToCreate: Tariff = message.body.tariff;
            const validateTariffResult = this.tariffValidator.validateTariff(requestedTariffToCreate);
            if (!validateTariffResult.success) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: validateTariffResult.errorCode as unknown as BusErrorCode,
                    description: validateTariffResult.errorMessage,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (!message.body.passwordHash) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.passwordHashIsRequired,
                    description: `Password hash is required when creating '${TariffType.prepaid}' tariff`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const tariffToCreate = this.tariffHelper.createTariffFromRequested(requestedTariffToCreate);
            const storageTariffToCreate = this.entityConverter.toStorageTariff(tariffToCreate);
            storageTariffToCreate.created_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdStorageTariff = await this.storageProvider.createTariff(storageTariffToCreate, message.body.passwordHash);
            await this.cacheAllTariffs();
            const createdTariff = this.entityConverter.toTariff(createdStorageTariff);
            replyMsg.body.tariff = createdTariff;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusCreatePrepaidTariffRequestMessage message`, message, err);
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: '',
                description: (err as any)?.message
            }];
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusCreateTariffRequestMessage(message: BusCreateTariffRequestMessage): Promise<void> {
        const replyMsg = createBusCreateTariffReplyMessage();
        try {
            const requestedTariffToCreate: Tariff = message.body.tariff;
            if (this.isPrepaidType(requestedTariffToCreate.type)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffMustNotBeOfPrepaidType,
                    description: `Specified tariff must not be of prepaid type`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const validateTariffResult = this.tariffValidator.validateTariff(requestedTariffToCreate);
            if (!validateTariffResult.success) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: validateTariffResult.errorCode as unknown as BusErrorCode,
                    description: validateTariffResult.errorMessage,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const tariffToCreate = this.tariffHelper.createTariffFromRequested(requestedTariffToCreate);
            const storageTariffToCreate = this.entityConverter.toStorageTariff(tariffToCreate);
            storageTariffToCreate.created_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdStorageTariff = await this.storageProvider.createTariff(storageTariffToCreate, undefined);
            await this.cacheAllTariffs();
            const createdTariff = this.entityConverter.toTariff(createdStorageTariff);
            replyMsg.body.tariff = createdTariff;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusCreateTariffRequestMessage message`, message, err);
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
            replyMsg.body.tariffs = allTariffs.map(tariff => this.entityConverter.toTariff(tariff));
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
            const deviceToUpdate: Device = message.body.device;
            if (!deviceToUpdate.approved || !deviceToUpdate.enabled) {
                // If the device must be made not active (not approved or not enabled)
                // the server must check if it is currently in use
                const storageDeviceStatus = await this.storageProvider.getDeviceStatus(deviceToUpdate.id);
                if (storageDeviceStatus?.started) {
                    this.logger.warn(`The device is currently started and cannot be made inactive`, message);
                    const replyMsg = createBusUpdateDeviceReplyMessage(message);
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.deviceIsInUse,
                        description: `The device Id ${deviceToUpdate.id} is currently started and cannot be made inactive`,
                    }];
                    this.publishToOperatorsChannel(replyMsg, message);
                    return;
                }
            }
            const storageDevice = this.entityConverter.toStorageDevice(message.body.device);
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
            replyMsg.body.device = updatedStorageDevice && this.entityConverter.toDevice(updatedStorageDevice);
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
            replyMsg.body.device = device && this.entityConverter.toDevice(device);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusDeviceGetByIdRequestMessage message`, message, err);
        }
    }

    async processBusOperatorGetAllDevicesRequest(message: BusOperatorGetAllDevicesRequestMessage): Promise<void> {
        const storageDevices = await this.storageProvider.getAllDevices();
        const replyMsg = createBusOperatorGetAllDevicesReplyMessage(message);
        replyMsg.body.devices = storageDevices.map(storageDevice => this.entityConverter.toDevice(storageDevice));
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
            msg.body.device = device && this.entityConverter.toDevice(device);
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

    async publishToSharedChannel<TBody>(message: Message<TBody>, sourceMessage: Message<any> | null): Promise<number> {
        if (sourceMessage) {
            // Transfer source message common data (like round trip data) to destination message
            transferSharedMessageData(message, sourceMessage);
        }
        return this.publishMessage(ChannelName.shared, message);
    }

    async publishNotificationMessageToSharedChannel<TBody>(message: Message<TBody>): Promise<number> {
        return this.publishMessage(ChannelName.shared, message);
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
        const allTariffs = storageTariffs.map(x => this.entityConverter.toTariff(x));
        await this.cacheHelper.setAllTariffs(allTariffs);
        return allTariffs;
    }

    private async getOrCacheAllTariffs(): Promise<Tariff[]> {
        let allTariffs = await this.cacheHelper.getAllTariffs();
        if (!allTariffs) {
            allTariffs = await this.cacheAllTariffs();
        }
        return allTariffs;
    }

    private async cacheAllDevices(): Promise<Device[]> {
        const storageDevices = await this.storageProvider.getAllDevices();
        const allDevices = storageDevices.map(x => this.entityConverter.toDevice(x));
        await this.cacheHelper.setAllDevices(allDevices);
        return allDevices;
    }

    private async getOrCacheAllDevices(): Promise<Device[]> {
        let allDevices = await this.cacheHelper.getAllDevices();
        if (!allDevices) {
            allDevices = await this.cacheAllDevices();
        }
        return allDevices;
    }

    private async cacheStaticData(): Promise<void> {
        const storageAllPermissions = await this.storageProvider.getAllPermissions();
        const allPermissions = storageAllPermissions.map(x => this.entityConverter.toPermission(x));
        this.cacheHelper.setAllPermissions(allPermissions);
    }

    private async refreshDeviceStatuses(): Promise<void> {
        try {
            const now = this.dateTimeHelper.getCurrentDateTimeAsNumber();
            this.state.lastDeviceStatusRefreshAt = now;
            this.state.deviceStatusRefreshInProgress = true;
            //            const storageDeviceStatuses = await this.storageProvider.getAllDeviceStatuses();
            const storageDeviceStatusesWithContinuationData = await this.storageProvider.getAllDeviceStatusesWithContinuationData();
            const allTariffs = await this.getOrCacheAllTariffs();
            let allDevices = await this.getOrCacheAllDevices();
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
                        if (this.isPrepaidType(tariff.type)) {
                            // Prepaid tariffs must update their remaining time
                            const updatedStorageTariff = await this.decreaseTariffRemainingSeconds(tariff.id, tariff.remainingSeconds!, originalCalculatedDeviceStatus.totalTime!);
                            if (!updatedStorageTariff) {
                                throw new Error(`Can't decrease tariff remaining seconds`);
                            }
                        }
                        const completeDeviceStatusUpdateResult = await this.storageProvider.completeDeviceStatusUpdate(storageDeviceStatus, storageDeviceSession);
                        if (!completeDeviceStatusUpdateResult) {
                            // Update failed
                            throw new Error(`Can't complete device status update`);
                        }
                    }
                    if (calculatedDeviceStatus.started && this.isPrepaidType(tariff.type)) {
                        // All devices started for prepaid tariff can be stopped by the customer
                        calculatedDeviceStatus.canBeStoppedByCustomer = true;
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
            const deviceStatusesMsg = createBusDeviceStatusesMessage();
            deviceStatusesMsg.body.deviceStatuses = deviceStatuses;
            this.publishToDevicesChannel(deviceStatusesMsg);
        } catch (err) {
            // TODO: Count database errors and eventually send system notification
            this.logger.error(`Can't refresh device statuses`, err);
        } finally {
            this.state.deviceStatusRefreshInProgress = false;
            this.state.lastDeviceStatusRefreshAt = this.dateTimeHelper.getCurrentDateTimeAsNumber();
        }
    }

    private async increaseTariffRemainingSeconds(tariffId: number, secondsToAdd: number, userId: number, increasedAt: string): Promise<IncreaseTariffRemainingSecondsResult | undefined> {
        const increaseResult = await this.storageProvider.increaseTariffRemainingSeconds(tariffId, secondsToAdd, userId, increasedAt);
        // After the tariff is updated we have to update the cache too, otherwise the tariff will still have the old remaining_seconds
        await this.cacheAllTariffs();
        return increaseResult;
    }

    private async decreaseTariffRemainingSeconds(tariffId: number, currentRemainingSeconds: number, secondsToSubtract: number): Promise<ITariff | undefined> {
        // Prepaid tariffs must update their remaining time
        let newRemainingSeconds = currentRemainingSeconds - secondsToSubtract;
        if (newRemainingSeconds < 0) {
            newRemainingSeconds = 0;
        }
        const storageTariff = await this.storageProvider.updateTariffRemainingSeconds(tariffId, newRemainingSeconds);
        // After the tariff is updated we have to update the cache too, otherwise the tariff will still have the old remaining_seconds
        // and can be started again even if the remaining seconds are 0
        await this.cacheAllTariffs();
        return storageTariff;
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

        if (this.isPrepaidType(tariff.type)) {
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
        // Prepaid tariff total sum is 0 - it was already paid and should not be shown to the user/customer to avoid confusion
        deviceStatus.totalSum = 0;
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
        deviceStatus.totalSum = this.getTotalSumCalculatingStartFreeTime(tariff, deviceStatus.totalTime);
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

    getTotalSumCalculatingStartFreeTime(tariff: Tariff, totalTimePassedSeconds: number): number {
        if (tariff.type === TariffType.duration || tariff.type === TariffType.fromTo) {
            const freeSecondsAtStart = this.getFreeSecondsAtComputerSessionStart();
            if (totalTimePassedSeconds < freeSecondsAtStart) {
                return 0;
            }
        }
        return tariff.price;
    }

    modifyDeviceStatusForFromToTariff(deviceStatus: DeviceStatus, tariff: Tariff): void {
        if (!deviceStatus.started) {
            // Stopped devices should have been modified when stopped
            return;
        }
        const now = this.dateTimeHelper.getCurrentDateTimeAsNumber();
        const startedAt = deviceStatus.startedAt!;
        const diffMs = now - startedAt;
        deviceStatus.totalSum = this.getTotalSumCalculatingStartFreeTime(tariff, diffMs / 100);
        const tariffFromMinute = tariff.fromTime!;
        const tariffToMinute = tariff.toTime!;

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

    private isWhiteSpace(string?: string | null): boolean {
        return !(string?.trim());
    }

    private async initializeDatabase(): Promise<boolean> {
        const storageProviderConnectionString = this.envVars.CCS3_STATE_MANAGER_STORAGE_CONNECTION_STRING.value;
        if (!storageProviderConnectionString?.trim()) {
            this.logger.error('The environment variable', this.envVars.CCS3_STATE_MANAGER_STORAGE_CONNECTION_STRING.name, 'value is empty');
            return false;
        }
        this.storageProvider = this.createStorageProvider();
        const storageProviderConfig: StorageProviderConfig = {
            // adminConnectionString: undefined,
            connectionString: storageProviderConnectionString,
            databaseMigrationsPath: this.envVars.CCS3_STATE_MANAGER_STORAGE_PROVIDER_DATABASE_MIGRATION_SCRIPTS_DIRECTORY.value,
        };
        const initRes = await this.storageProvider.init(storageProviderConfig);
        return initRes.success;
    }

    private createStorageProvider(): StorageProvider {
        return new PostgreStorageProvider();
    }

    private createDefaultState(): StateManagerState {
        const state: StateManagerState = {
            systemSettings: {
                [SystemSettingName.device_status_refresh_interval]: 5 * 1000,
                // 1800 seconds = 30 minutes
                [SystemSettingName.token_duration]: 1800 * 1000,
                // Empty timezone means the current computer timezone will be used
                [SystemSettingName.timezone]: '',
                [SystemSettingName.free_seconds_at_start]: 180,
                [SystemSettingName.seconds_before_restarting_stopped_computers]: 120,
            },
            lastDeviceStatusRefreshAt: 0,
            deviceStatusRefreshInProgress: false,
            mainTimerHandle: undefined,
        };
        return state;
    }

    private async loadSystemSettings(): Promise<ISystemSetting[]> {
        const allSystemSettings = await this.storageProvider.getAllSystemSettings();
        const settingsMap = new Map<string, ISystemSetting>();
        allSystemSettings.forEach(x => settingsMap.set(x.name, x));
        const getAsNumber = (name: SystemSettingName) => +settingsMap.get(name)?.value!;
        this.state.systemSettings = {
            [SystemSettingName.device_status_refresh_interval]: 1000 * getAsNumber(SystemSettingName.device_status_refresh_interval),
            [SystemSettingName.token_duration]: 1000 * getAsNumber(SystemSettingName.token_duration),
            [SystemSettingName.free_seconds_at_start]: getAsNumber(SystemSettingName.free_seconds_at_start),
            [SystemSettingName.timezone]: settingsMap.get(SystemSettingName.timezone)?.value!,
            [SystemSettingName.seconds_before_restarting_stopped_computers]: getAsNumber(SystemSettingName.seconds_before_restarting_stopped_computers),
        };
        return allSystemSettings;
    }

    private applySystemSettings(): void {
        // Some of the system settings need to be applied to other entities when they are changed,
        // not just set to this.state.systemSettings
        this.applySystemSettingTimeZone();
    }

    getFreeSecondsAtComputerSessionStart(): number {
        return this.state.systemSettings[SystemSettingName.free_seconds_at_start];
    }

    createUUIDString(): string {
        return randomUUID().toString();
    }

    isPrepaidType(tariffType: TariffType): boolean {
        return tariffType === TariffType.prepaid;
    }

    async start(): Promise<boolean> {
        this.cacheHelper.initialize(this.cacheClient);
        this.logger.setPrefix(this.className);
        const databaseInitialized = await this.initializeDatabase();
        if (!databaseInitialized) {
            this.logger.error('The database cannot be initialized');
            return false;
        }

        const storageSystemSettings = await this.loadSystemSettings();

        this.applySystemSettingTimeZone();
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

        const notificationMsg = createBusAllSystemSettingsNotificationMessage();
        const systemSettings = storageSystemSettings.map(x => this.entityConverter.toSystemSetting(x));
        notificationMsg.body.systemSettings = systemSettings;
        this.publishToSharedChannel(notificationMsg, null);

        return true;
    }

    applySystemSettingTimeZone(): void {
        this.dateTimeHelper.setDefaultTimeZone(this.state.systemSettings[SystemSettingName.timezone]);
    }

    setErrorToReplyMessage(err: unknown, requestMessage: Message<unknown>, replyMessage: Message<unknown>): void {
        this.logger.warn(`Can't process request message`, requestMessage, err);
        replyMessage.header.failure = true;
        replyMessage.header.errors = [{
            code: BusErrorCode.serverError,
            description: (err as any)?.message
        }];
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
    [SystemSettingName.free_seconds_at_start]: number;
    [SystemSettingName.seconds_before_restarting_stopped_computers]: number;
}

interface UserAuthDataCacheValue {
    userId: number;
    roundtripData: OperatorConnectionRoundTripData;
    permissions: string[];
    setAt: number;
    token: string;
    tokenExpiresAt: number;
}
