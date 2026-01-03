import { randomUUID } from 'node:crypto';

import {
    RedisSubClient, RedisPubClient, RedisCacheClient, CreateConnectedRedisClientOptions,
    RedisClientMessageCallback
} from '@computerclubsystem/redis-client';
import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';
import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { Logger } from './logger.mjs';
import { BusDeviceGetByCertificateRequestMessage, createBusDeviceGetByCertificateReplyMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-certificate.messages.mjs';
import { MessageType } from '@computerclubsystem/types/messages/declarations/message-type.mjs';
import { Device } from '@computerclubsystem/types/entities/device.mjs';
import { DeviceStatus, createBusDeviceStatusesNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-device-statuses-notification.message.mjs';
// import { DeviceState } from '@computerclubsystem/types/entities/device-state.mjs';
import { StorageProviderConfig } from './storage/storage-provider-config.mjs';
import { StorageProvider } from './storage/storage-provider.mjs';
import { PostgreStorageProvider } from './postgre-storage/postgre-storage-provider.mjs';
import { BusDeviceUnknownDeviceConnectedRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-unknown-device-connected.messages.mjs';
import { IDevice } from './storage/entities/device.mjs';
import { SystemSettingsName } from './storage/entities/constants/system-setting-names.mjs';
import { EntityConverter } from './entity-converter.mjs';
import { BusDeviceConnectionEventNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-device-connection-event-notification.message.mjs';
import { IDeviceConnectionEvent } from './storage/entities/device-connection-event.mjs';
import { BusUserAuthRequestMessage, BusUserAuthReplyMessage, createBusUserAuthReplyMessage } from '@computerclubsystem/types/messages/bus/bus-operator-auth.messages.mjs';
import { transferSharedMessageData } from '@computerclubsystem/types/messages/utils.mjs';
import { ISystemSetting } from './storage/entities/system-setting.mjs';
import { CacheHelper } from './cache-helper.mjs';
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { BusOperatorConnectionEventNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-operator-connection-event-notification.message.mjs';
import { IOperatorConnectionEvent } from './storage/entities/operator-connection-event.mjs';
import { BusGetAllDevicesRequestMessage, createBusOperatorGetAllDevicesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-devices.messages.mjs';
import { BusDeviceGetByIdRequestMessage, createBusDeviceGetByIdReplyMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id.messages.mjs';
import { BusUpdateDeviceRequestMessage, createBusUpdateDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-device.messages.mjs';
import { IDeviceStatus, IDeviceStatusWithContinuationData } from './storage/entities/device-status.mjs';
import { BusGetAllTariffsRequestMessage, createBusGetAllTariffsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-tariffs.messages.mjs';
import { BusCreateTariffRequestMessage, createBusCreateTariffReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-tariff.messages.mjs';
import { Tariff, TariffShortInfo, TariffType } from '@computerclubsystem/types/entities/tariff.mjs';
import { BusStartDeviceRequestMessage, createBusStartDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-start-device.messages.mjs';
import { TariffHelper } from './tariff-helper.mjs';
import { BusErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-error-code.mjs';
import { DateTimeHelper } from './date-time-helper.mjs';
import { BusGetTariffByIdRequestMessage, createBusGetTariffByIdReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-tariff-by-id.messages.mjs';
import { BusUpdateTariffRequestMessage, createBusUpdateTariffReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-tariff.messages.mjs';
import { IDeviceSession } from './storage/entities/device-session.mjs';
import { BusGetAllRolesRequestMessage, createBusGetAllRolesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-roles.messages.mjs';
import { BusGetRoleWithPermissionsRequestMessage, createBusGetRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-role-with-permissions.messages.mjs';
import { BusGetAllPermissionsRequestMessage, createBusGetAllPermissionsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-permissions.messages.mjs';
import { BusCreateRoleWithPermissionsRequestMessage, createBusCreateRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-role-with-permissions.messages.mjs';
import { Role } from '@computerclubsystem/types/entities/role.mjs';
import { BusUpdateRoleWithPermissionsRequestMessage, createBusUpdateRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-role-with-permissions.messages.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { BusGetAllUsersRequestMessage, createBusGetAllUsersReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-users.messages.mjs';
import { BusCreateUserWithRolesRequestMessage, createBusCreateUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-user-with-roles.messages.mjs';
import { User } from '@computerclubsystem/types/entities/user.mjs';
import { BusGetUserWithRolesRequestMessage, createBusGetUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-user-with-roles.messages.mjs';
import { BusUpdateUserWithRolesRequestMessage, createBusUpdateUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-user-with-roles.messages.mjs';
import { BusStopDeviceRequestMessage, createBusStopDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-stop-device.messages.mjs';
import { BusTransferDeviceRequestMessage, createBusTransferDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-transfer-device.messages.mjs';
import { SystemNotes } from './system-notes.mjs';
import { IDeviceContinuation } from './storage/entities/device-continuation.mjs';
import { DeviceContinuation } from '@computerclubsystem/types/entities/device-continuation.mjs';
import { BusCreateDeviceContinuationRequestMessage, createBusCreateDeviceContinuationReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-continuation.messages.mjs';
import { BusDeleteDeviceContinuationRequestMessage, createBusDeleteDeviceContinuationReplyMessage } from '@computerclubsystem/types/messages/bus/bus-delete-device-continuation.messages.mjs';
import { TariffValidator } from './tariff-validator.mjs';
import { BusRechargeTariffDurationRequestMessage, createBusRechargeTariffDurationReplyMessage } from '@computerclubsystem/types/messages/bus/bus-recharge-tariff-duration.messages.mjs';
import { IncreaseTariffRemainingSecondsResult } from './storage/results.mjs';
import { BusStartDeviceOnPrepaidTariffByCustomerRequestMessage, createBusStartDeviceOnPrepaidTariffByCustomerReplyMessage } from '@computerclubsystem/types/messages/bus/bus-start-device-on-prepaid-tariff-by-customer.messages.mjs';
import { BusEndDeviceSessionByCustomerRequestMessage, createBusEndDeviceSessionByCustomerReplyMessage } from '@computerclubsystem/types/messages/bus/bus-end-device-session-by-customer.messages.mjs';
import { ITariff } from './storage/entities/tariff.mjs';
import { BusChangePrepaidTariffPasswordByCustomerRequestMessage, createBusChangePrepaidTariffPasswordByCustomerReplyMessage } from '@computerclubsystem/types/messages/bus/bus-change-prepaid-tariff-password-by-customer.messages.mjs';
import { BusGetCurrentShiftStatusRequestMessage, createBusGetCurrentShiftStatusReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-current-shift-status.messages.mjs';
import { ShiftStatus } from '@computerclubsystem/types/entities/shift-status.mjs';
import { BusCompleteShiftRequestMessage, createBusCompleteShiftReplyMessage } from '@computerclubsystem/types/messages/bus/bus-complete-shift.messages.mjs';
import { IShift } from './storage/entities/shift.mjs';
import { BusGetShiftsRequestMessage, createBusGetShiftsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-shifts.messages.mjs';
import { BusGetAllSystemSettingsRequestMessage, createBusGetAllSystemSettingsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings.messages.mjs';
import { BusUpdateSystemSettingsValuesRequestMessage, createBusUpdateSystemSettingsValuesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-system-settings-values.messages.mjs';
import { SystemSettingsValidator } from './system-settings-validator.mjs';
import { createBusAllSystemSettingsNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-all-system-settings-notification.message.mjs';
import { BusCreateDeviceRequestMessage, createBusCreateDeviceReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-device.messages.mjs';
import { BusCreatePrepaidTariffRequestMessage, createBusCreatePrepaidTariffReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-prepaid-tariff.messages.mjs';
import { BusChangePasswordRequestMessage, createBusChangePasswordReplyMessage } from '@computerclubsystem/types/messages/bus/bus-change-password.messages.mjs';
import { BusGetProfileSettingsRequestMessage, createBusGetProfileSettingsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-profile-settings.messages.mjs';
import { UserProfileSettingWithValue } from '@computerclubsystem/types/entities/user-profile-setting-with-value.mjs';
import { BusUpdateProfileSettingsRequestMessage, createBusUpdateProfileSettingsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-profile-settings.messages.mjs';
import { IUserProfileSettingWithValue } from './storage/entities/user-profile-setting-with-value.mjs';
import { BusGetAllDeviceGroupsRequestMessage, createBusGetAllDeviceGroupsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-device-groups.messages.mjs';
import { BusGetDeviceGroupDataRequestMessage, createBusGetDeviceGroupDataReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-group-data.messages.mjs';
import { DeviceGroupData } from '@computerclubsystem/types/entities/device-group-data.mjs';
import { BusCreateDeviceGroupRequestMessage, createBusCreateDeviceGroupReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-group.messages.mjs';
import { DeviceGroup } from '@computerclubsystem/types/entities/device-group.mjs';
import { BusUpdateDeviceGroupRequestMessage, createBusUpdateDeviceGroupReplyMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-group.messages.mjs';
import { BusGetAllAllowedDeviceObjectsRequestMessage, createBusGetAllAllowedDeviceObjectsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-allowed-device-objects.messages.mjs';
import { AllowedDeviceObjects } from '@computerclubsystem/types/entities/allowed-device-objects.mjs';
import { IDeviceGroup } from './storage/entities/device-group.mjs';
import { ITariffInDeviceGroup } from './storage/entities/tariff-in-device-group.mjs';
import { BusSetDeviceStatusNoteRequestMessage, createBusSetDeviceStatusNoteReplyMessage } from '@computerclubsystem/types/messages/bus/bus-set-device-status-note.messages.mjs';
import { BusGetLastCompletedShiftRequestMessage, createBusGetLastCompletedShiftReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-last-completed-shift.messages.mjs';
import { UserWithTotalAndCount } from '@computerclubsystem/types/entities/user-total-and-count.mjs';
import { BusGetDeviceCompletedSessionsRequestMessage, createBusGetDeviceCompletedSessionsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-completed-sessions.messages.mjs';
import { FilterServerLogsItem } from '@computerclubsystem/types/messages/shared-declarations/filter-server-logs-item.mjs';
import { BusFilterServerLogsNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-filter-server-logs-notification.message.mjs';
import { BusGetDeviceStatusesRequestMessage, createBusGetDeviceStatusesReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-statuses.messages.mjs';
import { BusGetTariffDeviceGroupsRequestMessage, createBusGetTariffDeviceGroupsReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-tariff-device-groups.messages.mjs';
import { BusCreateLongLivedAccessTokenForUserRequestMessage, createBusCreateLongLivedAccessTokenForUserReplyMessage } from '@computerclubsystem/types/messages/bus/bus-create-long-lived-access-token-for-user.messages.mjs';
import { ILongLivedAccessToken } from './storage/entities/long-lived-access-token.mjs';
import { BusGetLongLivedAccessTokenRequestMessage, createBusGetLongLivedAccessTokenReplyMessage } from '@computerclubsystem/types/messages/bus/bus-get-long-lived-access-token.messages.mjs';
import { BusUserAuthWithLongLivedAccessTokenRequestMessage, createBusUserAuthWithLongLivedAccessTokenReplyMessage } from '@computerclubsystem/types/messages/bus/bus-user-auth-with-long-lived-access-token.messages.mjs';
import { BusCreateLongLivedAccessTokenForTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-long-lived-access-token-for-tariff.messages.mjs';
import { ILongLivedAccessTokenUsage } from './storage/entities/long-lived-access-token-usage.mjs';
import { LongLivedAccessToken } from '@computerclubsystem/types/entities/long-lived-access-token.mjs';
import { BusChangePasswordWithLongLivedAccessTokenRequestMessage, createBusChangePasswordWithLongLivedAccessTokenReplyMessage } from '@computerclubsystem/types/messages/bus/bus-change-password-with-long-lived-access-token.messages.mjs';
import { BusChangePasswordWithLongLivedAccessTokenErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-change-password-with-long-lived-access-token-error-code.mjs';
import { TariffUsage } from '@computerclubsystem/types/messages/shared-declarations/tariff-usage.mjs';
import { DeviceUsage } from '@computerclubsystem/types/messages/shared-declarations/device-usage.mjs';

export class StateManager {
    private readonly className = (this as object).constructor.name;
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

    processReceivedBusMessage(channelName: string, message: Message<unknown>): void {
        if (this.isOwnMessage(message)) {
            return;
        }
        this.logger.log(`Received channel ${channelName} message ${message.header.type}`, message);
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
            case MessageType.busChangePasswordWithLongLivedAccessTokenRequest:
                this.processBusChangePasswordWithLongLivedAccessTokenRequestMessage(message as BusChangePasswordWithLongLivedAccessTokenRequestMessage);
                break;
            case MessageType.busCreateLongLivedAccessTokenForTariffRequest:
                this.processBusCreateLongLivedAccessTokenForTariffRequestMessage(message as BusCreateLongLivedAccessTokenForTariffRequestMessage);
                break;
            case MessageType.busGetLongLivedAccessTokenRequest:
                this.processBusGetLongLivedAccessTokenRequestMessage(message as BusGetLongLivedAccessTokenRequestMessage);
                break;
            case MessageType.busCreateLongLivedAccessTokenForUserRequest:
                this.processBusCreateLongLivedAccessTokenForUserRequestMessage(message as BusCreateLongLivedAccessTokenForUserRequestMessage);
                break;
            case MessageType.busFilterServerLogsNotification:
                this.processBusFilterServerLogsNotificationMessage(message as BusFilterServerLogsNotificationMessage);
                break;
            case MessageType.busGetLastCompletedShiftRequest:
                this.processBusGetLastCompletedShiftRequestMessage(message as BusGetLastCompletedShiftRequestMessage);
                break;
            case MessageType.busUpdateSystemSettingsValuesRequest:
                this.processSharedMessageBusUpdateSystemSettingsValues(message as BusUpdateSystemSettingsValuesRequestMessage);
                break;
            case MessageType.busGetAllSystemSettingsRequest:
                this.processSharedMessageBusGetAllSystemSettings(message as BusGetAllSystemSettingsRequestMessage);
                break;
        }
    }

    async processBusChangePasswordWithLongLivedAccessTokenRequestMessage(message: BusChangePasswordWithLongLivedAccessTokenRequestMessage): Promise<void> {
        const replyMsg = createBusChangePasswordWithLongLivedAccessTokenReplyMessage();
        if (!message.body.token) {
            replyMsg.body.errorCode = BusChangePasswordWithLongLivedAccessTokenErrorCode.invalidToken;
            replyMsg.body.errorMessage = 'Token was not provided';
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: BusErrorCode.tokenIsRequired,
                description: 'Token is required',
            }];
            this.publishToSharedChannel(replyMsg, message);
            return;
        }

        if (!message.body.passwordHash) {
            replyMsg.body.errorCode = BusChangePasswordWithLongLivedAccessTokenErrorCode.invalidPassword;
            replyMsg.body.errorMessage = 'Invalid password';
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: BusErrorCode.passwordHashIsRequired,
                description: 'Password hash is required',
            }];
            this.publishToSharedChannel(replyMsg, message);
            return;
        }

        try {
            const storageLongLivedToken = await this.storageProvider.getLongLivedAccessToken(message.body.token);
            if (!storageLongLivedToken) {
                replyMsg.body.errorCode = BusChangePasswordWithLongLivedAccessTokenErrorCode.invalidToken;
                replyMsg.body.errorMessage = 'Token is invalid';
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.invalidToken,
                    description: 'Invalid token',
                }];
                this.publishToSharedChannel(replyMsg, message);
                return;
            }
            const hasExpired = Date.now() > new Date(storageLongLivedToken.valid_to).getTime();
            if (hasExpired) {
                replyMsg.body.errorCode = BusChangePasswordWithLongLivedAccessTokenErrorCode.invalidToken;
                replyMsg.body.errorMessage = 'Token is invalid or expired';
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tokenExpired,
                    description: 'Token expired',
                }];
                this.publishToSharedChannel(replyMsg, message);
                return;
            }
            const doesNotHaveIdentifier = !storageLongLivedToken.user_id && !storageLongLivedToken.tariff_id;
            if (doesNotHaveIdentifier) {
                replyMsg.body.errorCode = BusChangePasswordWithLongLivedAccessTokenErrorCode.invalidToken;
                replyMsg.body.errorMessage = 'Token is invalid';
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.invalidToken,
                    description: 'Invalid token',
                }];
                this.publishToSharedChannel(replyMsg, message);
                return;
            }
            if (storageLongLivedToken.tariff_id) {
                const allTariffs = await this.cacheHelper.getAllTariffs();
                const tariff = allTariffs?.find(x => x.id === storageLongLivedToken.tariff_id);
                if (tariff?.type !== TariffType.prepaid) {
                    replyMsg.body.errorCode = BusChangePasswordWithLongLivedAccessTokenErrorCode.invalidToken;
                    replyMsg.body.errorMessage = 'Token is invalid';
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.invalidToken,
                        description: 'Invalid token',
                    }];
                    this.publishToSharedChannel(replyMsg, message);
                    return;
                } else if (!tariff?.enabled) {
                    replyMsg.body.errorCode = BusChangePasswordWithLongLivedAccessTokenErrorCode.customerCardIsNotEnabled;
                    replyMsg.body.errorMessage = 'The customer card is not enabled';
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.tariffIsNotActive,
                        description: 'The tariff is not active',
                    }];
                    this.publishToSharedChannel(replyMsg, message);
                    return;
                } else {
                    // Change the tariff password
                    await this.storageProvider.updateTariffPasswordHash(tariff.id, message.body.passwordHash);
                    replyMsg.body.success = true;
                    this.publishToSharedChannel(replyMsg, message);
                    return;
                }
            }
            if (storageLongLivedToken.user_id) {
                const storageUser = await this.storageProvider.getUserById(storageLongLivedToken.user_id);
                if (!storageUser?.enabled) {
                    replyMsg.body.errorCode = BusChangePasswordWithLongLivedAccessTokenErrorCode.userIsDisabled;
                    replyMsg.body.errorMessage = 'The user is disabled';
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.userIsNotActive,
                        description: 'The user is not active',
                    }];
                    this.publishToSharedChannel(replyMsg, message);
                    return;
                } else {
                    // Change the user password
                    const updatePasswordHashResult = await this.storageProvider.updateUserPasswordHash(storageUser.id, message.body.passwordHash);
                    if (!updatePasswordHashResult) {
                        replyMsg.body.errorCode = BusChangePasswordWithLongLivedAccessTokenErrorCode.invalidUser;
                        replyMsg.body.errorMessage = 'The user is invalid';
                        replyMsg.header.failure = true;
                        replyMsg.header.errors = [{
                            code: BusErrorCode.userNotUpdated,
                            description: 'The user is not updated',
                        }];
                        this.publishToSharedChannel(replyMsg, message);
                        return;
                    } else {
                        replyMsg.body.success = true;
                        this.publishToSharedChannel(replyMsg, message);
                        return;
                    }
                }
            }
        } catch (err) {
            replyMsg.body.errorCode = BusChangePasswordWithLongLivedAccessTokenErrorCode.serverError;
            replyMsg.body.errorMessage = 'Server error';
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: BusErrorCode.serverError,
                description: 'Server error',
            }];
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToSharedChannel(replyMsg, message);
        }
    }

    async processBusGetLongLivedAccessTokenRequestMessage(message: BusGetLongLivedAccessTokenRequestMessage): Promise<void> {
        const replyMsg = createBusGetLongLivedAccessTokenReplyMessage();
        if (!message.body.token) {
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: BusErrorCode.tokenIsRequired,
                description: 'Token is required',
            }];
            this.publishToSharedChannel(replyMsg, message);
            return;
        }

        try {
            const storageLongLivedToken = await this.storageProvider.getLongLivedAccessToken(message.body.token);
            if (storageLongLivedToken) {
                replyMsg.body.longLivedAccessToken = this.entityConverter.toLongLivedAccessToken(storageLongLivedToken);
                replyMsg.body.hasExpired = Date.now() > new Date(storageLongLivedToken.valid_to).getTime();
            }
            this.publishToSharedChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToSharedChannel(replyMsg, message);
        }
    }

    async processBusCreateLongLivedAccessTokenForTariffRequestMessage(message: BusCreateLongLivedAccessTokenForTariffRequestMessage): Promise<void> {
        const replyMsg = createBusCreateLongLivedAccessTokenForUserReplyMessage();
        try {
            if (!message.body.tariffId || !message.body.passwordHash?.trim()) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIdIsRequired,
                    description: 'Tariff id is required',
                }];
                this.publishToSharedChannel(replyMsg, message);
                return;
            }
            const tariff = await this.storageProvider.getTariffById(message.body.tariffId);
            if (!tariff) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userNotFound,
                    description: `Tariff with Id ${message.body.tariffId} not found`,
                }];
                this.publishToSharedChannel(replyMsg, message);
                return;
            }
            if (!tariff.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIsNotActive,
                    description: `Tariff '${tariff.name}' is not active`,
                }];
                this.publishToSharedChannel(replyMsg, message);
                return;
            }
            const issuedAt = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const validTo = this.dateTimeHelper.addSeconds(issuedAt, this.state.longLivedTokenDurationSeconds);
            const token = this.createUUIDString();
            const storageLongLivedAccessToken: ILongLivedAccessToken = {
                issued_at: issuedAt,
                valid_to: validTo,
                token: token,
                tariff_id: tariff.id,
            } as ILongLivedAccessToken;
            const createdStorageLongLivedAccessToken = await this.storageProvider.setLongLivedAccessToken(storageLongLivedAccessToken);
            if (createdStorageLongLivedAccessToken) {
                replyMsg.body.longLivedToken = this.entityConverter.toLongLivedAccessToken(createdStorageLongLivedAccessToken);
                this.publishToSharedChannel(replyMsg, message);
            } else {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.serverError,
                    description: `Can't create long lived access token`,
                }] as MessageError[];
                this.publishToSharedChannel(replyMsg, message);
            }
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToSharedChannel(replyMsg, message);
        }
    }

    async processBusCreateLongLivedAccessTokenForUserRequestMessage(message: BusCreateLongLivedAccessTokenForUserRequestMessage): Promise<void> {
        const replyMsg = createBusCreateLongLivedAccessTokenForUserReplyMessage();
        try {
            if (!message.body.username?.trim() || !message.body.passwordHash?.trim()) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.usernameIsRequired,
                    description: 'Username is required',
                }];
                this.publishToSharedChannel(replyMsg, message);
                return;
            }
            const username = message.body.username.trim();
            const user = await this.storageProvider.getUserByUsernameAndPasswordHash(username, message.body.passwordHash);
            if (!user) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userNotFound,
                    description: `User with username ${username} not found`,
                }];
                this.publishToSharedChannel(replyMsg, message);
                return;
            }
            if (!user.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIsNotActive,
                    description: `User '${user.username}' is not active`,
                }];
                this.publishToSharedChannel(replyMsg, message);
                return;
            }
            const issuedAt = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const validTo = this.dateTimeHelper.addSeconds(issuedAt, this.state.longLivedTokenDurationSeconds);
            const token = this.createUUIDString();
            const storageLongLivedAccessToken: ILongLivedAccessToken = {
                issued_at: issuedAt,
                valid_to: validTo,
                token: token,
                user_id: user.id,
            } as ILongLivedAccessToken;
            const createdStorageLongLivedAccessToken = await this.storageProvider.setLongLivedAccessToken(storageLongLivedAccessToken);
            if (createdStorageLongLivedAccessToken) {
                replyMsg.body.longLivedToken = this.entityConverter.toLongLivedAccessToken(createdStorageLongLivedAccessToken);
                this.publishToSharedChannel(replyMsg, message);
            } else {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.serverError,
                    description: `Can't create long lived access token`,
                }] as MessageError[];
                this.publishToSharedChannel(replyMsg, message);
            }
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToSharedChannel(replyMsg, message);
        }
    }


    processBusFilterServerLogsNotificationMessage(message: BusFilterServerLogsNotificationMessage): void {
        const pcConnectorItem = message.body.filterServerLogsItems.find(x => x.serviceName === this.messageBusIdentifier);
        if (pcConnectorItem) {
            if (pcConnectorItem) {
                this.state.filterLogsItem = pcConnectorItem;
                this.state.filterLogsRequestedAt = this.dateTimeHelper.getCurrentDateTimeAsNumber();
                this.logger.setMessageFilter(pcConnectorItem.messageFilter);
            }
        }
    }

    async processBusGetLastCompletedShiftRequestMessage(message: BusGetLastCompletedShiftRequestMessage): Promise<void> {
        const replyMsg = createBusGetLastCompletedShiftReplyMessage();
        try {
            const storageShift = await this.storageProvider.getLastShift();
            replyMsg.body.shift = storageShift ? this.entityConverter.toShift(storageShift) : null;
            if (storageShift) {
                const sotrageUser = await this.storageProvider.getUserById(storageShift.user_id);
                replyMsg.body.completedByUsername = sotrageUser?.username;
            }
            this.publishToSharedChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToSharedChannel(replyMsg, message);
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
            case MessageType.busUserAuthWithLongLivedAccessTokenRequest:
                this.processBusUserAuthWithLongLivedAccessTokenRequestMessage(message as BusUserAuthWithLongLivedAccessTokenRequestMessage);
                break;
            case MessageType.busGetTariffDeviceGroupsRequest:
                this.processBusGetTariffDeviceGroupsRequestMessage(message as BusGetTariffDeviceGroupsRequestMessage);
                break;
            case MessageType.busGetDeviceCompletedSessionsRequest:
                this.processBusGetDeviceCompletedSessionsRequestMessage(message as BusGetDeviceCompletedSessionsRequestMessage);
                break;
            case MessageType.busSetDeviceStatusNoteRequest:
                this.processBusSetDeviceStatusNoteRequestMessage(message as BusSetDeviceStatusNoteRequestMessage);
                break;
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
            case MessageType.busGetDeviceByIdRequest:
                this.processBusGetDeviceByIdRequest(message as BusDeviceGetByIdRequestMessage);
                break;
            case MessageType.busGetAllDevicesRequest:
                this.processBusGetAllDevicesRequest(message as BusGetAllDevicesRequestMessage);
                break;
            case MessageType.busUserAuthRequest:
                this.processBusUserAuthRequest(message as BusUserAuthRequestMessage);
                break;
            case MessageType.busUserConnectionEventNotification:
                this.processBusUserConnectionEventNotification(message as BusOperatorConnectionEventNotificationMessage);
                break;
        }
    }

    processDevicesChannelMessage<TBody>(message: Message<TBody>): void {
        const type = message.header?.type;
        switch (type) {
            case MessageType.busGetDeviceStatusesRequest:
                this.processBusGetDeviceStatusesRequestMessage(message as BusGetDeviceStatusesRequestMessage);
                break;
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
            case MessageType.busDeviceConnectionEventNotification:
                this.processDeviceConnectionEventMessage(message as BusDeviceConnectionEventNotificationMessage);
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
        const getObjectValue = (obj: unknown, key: string) => (obj as never)[key];
        const keysToExclude = new Set<string>(['completedSummaryByUser', 'runningSummaryByUser']);
        for (const key of leftKeys) {
            // We must exclude objects like arrays
            if (!keysToExclude.has(key)) {
                const leftValue = getObjectValue(left, key);
                const rightValue = getObjectValue(right, key);
                if (leftValue !== rightValue) {
                    return false;
                }
            }
        }

        return true;
    }

    async processBusGetDeviceStatusesRequestMessage(message: BusGetDeviceStatusesRequestMessage): Promise<void> {
        const replyMsg = createBusGetDeviceStatusesReplyMessage();
        try {
            // TODO: This is the simplified version which does not return continuationTariffShortInfos
            //       And will not recalculate status before returning the result
            //       For recalculating device statuses this.refreshDeviceStatuses must be used
            const allStorageDeviceStatuses = await this.storageProvider.getAllDeviceStatuses();
            replyMsg.body.deviceStatuses = allStorageDeviceStatuses.map(x => this.entityConverter.toDeviceStatus(x));
            this.publishToDevicesChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToDevicesChannel(replyMsg, message);
        }
    }

    async processBusUserAuthWithLongLivedAccessTokenRequestMessage(message: BusUserAuthWithLongLivedAccessTokenRequestMessage): Promise<void> {
        const replyMsg = createBusUserAuthWithLongLivedAccessTokenReplyMessage();
        if (!message.body.token) {
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: BusErrorCode.tokenIsRequired,
                description: 'Token is required',
            }];
            this.publishToOperatorsChannel(replyMsg, message);
            return;
        }

        try {
            const authReplyMsg = await this.getBusUserAuthReplyMessageForLongLivedAccessToken(message.body.token);
            replyMsg.body.success = authReplyMsg.body.success;
            replyMsg.body.permissions = authReplyMsg.body.permissions;
            replyMsg.body.userId = authReplyMsg.body.userId;
            replyMsg.body.username = authReplyMsg.body.username;
            replyMsg.header.errors = authReplyMsg.header.errors;
            replyMsg.header.failure = authReplyMsg.header.failure;
            this.publishToOperatorsChannel(replyMsg, message);
            if (replyMsg.body.success && authReplyMsg.body.longLivedAccessToken) {
                // Save success token usage
                // Reresh long lived access token valid_to
                const longLivedAccessToken: LongLivedAccessToken = authReplyMsg.body.longLivedAccessToken;
                await this.extendValidToOfLongLivedAccessToken(longLivedAccessToken.id);
                try {
                    const storageLongLivedAccessTokenUsage: ILongLivedAccessTokenUsage = {
                        token: message.body.token,
                        used_at: this.dateTimeHelper.getCurrentUTCDateTimeAsISOString(),
                        device_id: message.body.deviceId,
                        tariff_id: longLivedAccessToken?.tariffId,
                        user_id: longLivedAccessToken?.userId,
                        ip_address: message.body.ipAddress,
                        valid_to: longLivedAccessToken.validTo,
                    } as ILongLivedAccessTokenUsage;
                    await this.storageProvider.addLongLivedAccessTokenUsage(storageLongLivedAccessTokenUsage);
                } catch (err) {
                    this.logger.warn('Cannot save long lived access token usage', err);
                }
            }
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetTariffDeviceGroupsRequestMessage(message: BusGetTariffDeviceGroupsRequestMessage): Promise<void> {
        const replyMsg = createBusGetTariffDeviceGroupsReplyMessage();
        try {
            if (!(message.body.tariffId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIdIsRequired,
                    description: 'Tariff id is required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            replyMsg.body.deviceGroupIds = await this.storageProvider.getTariffDeviceGroups(message.body.tariffId);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }


    async processBusGetDeviceCompletedSessionsRequestMessage(message: BusGetDeviceCompletedSessionsRequestMessage): Promise<void> {
        const replyMsg = createBusGetDeviceCompletedSessionsReplyMessage();
        try {
            if (!message.body.fromDate || !message.body.toDate) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.fromAndToDatesAreRequired,
                    description: 'From and To dates are required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const fromDate = this.dateTimeHelper.convertToUTC(message.body.fromDate);
            if (!fromDate) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.fromAndToDatesAreRequired,
                    description: 'From and To dates are required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const toDate = this.dateTimeHelper.convertToUTC(message.body.toDate);
            if (!toDate) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.fromAndToDatesAreRequired,
                    description: 'From and To dates are required',
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }

            const storageDeviceSessions = await this.storageProvider.getDeviceSessions(
                fromDate,
                toDate,
                message.body.userId,
                message.body.deviceId,
                message.body.tariffId,
            );
            const deviceSessions = storageDeviceSessions.map(x => this.entityConverter.toDeviceSession(x));
            const totalSum = deviceSessions.reduce((acc, curr) => this.roundAmount(acc + curr.totalAmount), 0);
            replyMsg.body.deviceSessions = deviceSessions;
            replyMsg.body.totalSum = totalSum;

            const groupedByTariffId = this.groupBy(deviceSessions, x => x.tariffId);
            const tariffUsages: TariffUsage[] = [];
            for (const group of groupedByTariffId) {
                const totalAmountSum = group.items.map(x => x.totalAmount).reduce((prev, curr) => this.roundAmount(prev + curr), 0);
                const totalTimeSeconds = Math.floor(group.items.map(x => this.dateTimeHelper.getDiff(x.startedAt, x.stoppedAt)).reduce((prev, curr) => prev + curr, 0) / 1000);
                tariffUsages.push({
                    count: group.items.length,
                    tariffId: group.key,
                    totalAmount: totalAmountSum,
                    totalTime: totalTimeSeconds,
                });
            }
            replyMsg.body.tariffUsages = tariffUsages;

            const groupedByDeviceId = this.groupBy(deviceSessions, x => x.deviceId);
            const deviceUsages: DeviceUsage[] = [];
            for (const group of groupedByDeviceId) {
                const totalAmountSum = group.items.map(x => x.totalAmount).reduce((prev, curr) => this.roundAmount(prev + curr), 0);
                const totalTimeSeconds = Math.floor(group.items.map(x => this.dateTimeHelper.getDiff(x.startedAt, x.stoppedAt)).reduce((prev, curr) => prev + curr, 0) / 1000);
                const zeroPriceSessions = group.items.filter(x => x.totalAmount === 0);
                const zeroPriceSessionsTotalTime = Math.floor(zeroPriceSessions.map(x => this.dateTimeHelper.getDiff(x.startedAt, x.stoppedAt)).reduce((prev, curr) => prev + curr, 0) / 1000);
                deviceUsages.push({
                    count: group.items.length,
                    deviceId: group.key,
                    totalAmount: totalAmountSum,
                    totalTime: totalTimeSeconds,
                    zeroPriceSessionsCount: zeroPriceSessions.length,
                    zeroPriceSessionsTotalTime: zeroPriceSessionsTotalTime,
                });
            }
            replyMsg.body.deviceUsages = deviceUsages;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    validateBusSetDeviceStatusNoteRequestMessage(message: BusSetDeviceStatusNoteRequestMessage): MessageError[] | null {
        for (const deviceId of message.body.deviceIds) {
            if (!(deviceId > 0)) {
                return [{
                    code: BusErrorCode.deviceIdIsRequired,
                    description: 'Device Id is required',
                }];
            }
        }
        return null;
    }

    async processBusSetDeviceStatusNoteRequestMessage(message: BusSetDeviceStatusNoteRequestMessage): Promise<void> {
        const replyMsg = createBusSetDeviceStatusNoteReplyMessage();
        try {
            const validateResult = this.validateBusSetDeviceStatusNoteRequestMessage(message);
            if (validateResult) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = validateResult;
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            await this.storageProvider.setDeviceStatusNote(message.body.deviceIds, message.body.note);
            this.refreshDeviceStatuses();
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
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
                for (const item of storageDeviceGroupsMap) {
                    const storageDeviceGroup = item[1];
                    if (!storageDeviceGroup.restrict_device_transfers) {
                        groupsWithoutTransferRestriction.push(storageDeviceGroup);
                    }
                }
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
            if (!storageUser) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userNotFound,
                    description: `User with ID ${message.body.userId} is not found`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            replyMsg.body.settings = profileSettings;
            replyMsg.body.username = storageUser.username;
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
            };
            // Create record in device statuses database table
            await this.storageProvider.addOrUpdateDeviceStatusEnabled(storageDeviceStatus);
            this.logger.log(`New device created. Device Id ${createdStorageDevice.id}`);
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
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async getShiftStatus(): Promise<ShiftStatus> {
        const allStorageUsers = await this.storageProvider.getAllUsers();
        const allUsers = allStorageUsers.map(x => this.entityConverter.toUser(x));
        const allUsersMap = new Map<number, User>(allUsers.map(x => ([x.id, x])));
        const userWithTotalAndCountCompletedMap = new Map<number | undefined | null, UserWithTotalAndCount>();
        const userWithTotalAndCountRunningMap = new Map<number | undefined | null, UserWithTotalAndCount>();
        const allTariffs = await this.getOrCacheAllTariffs();
        const nowISOString = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();

        // Get last shift to know from which date-time to calculate current shift
        const storageLastShift = await this.storageProvider.getLastShift();
        const fromDate = storageLastShift?.completed_at;
        // Completed device sessions since when the last shift was completed
        const storageCompletedSessionsSummary = await this.storageProvider.getCompletedSessionsSummary(fromDate, nowISOString);
        // If there are no completed sessions, the count will be 0 but total is null - change it to 0 in this case
        storageCompletedSessionsSummary.total ||= 0;
        // Get totals by stopped/started user
        for (const completedSessionItem of storageCompletedSessionsSummary.completedSessions) {
            const userId = completedSessionItem.stopped_by_user_id || completedSessionItem.started_by_user_id;
            const mapItem = userWithTotalAndCountCompletedMap.get(userId);
            if (mapItem === undefined) {
                const userWithTotalAndCount: UserWithTotalAndCount = {
                    count: 1,
                    total: completedSessionItem.total_amount,
                    username: allUsersMap.get(userId!)?.username || '',
                };
                userWithTotalAndCountCompletedMap.set(userId, userWithTotalAndCount);
            } else {
                mapItem.count++;
                mapItem.total = this.roundAmount(mapItem.total + completedSessionItem.total_amount);
            }
        }

        // Created prepaid tariffs
        const storageCreatedTariffs = await this.storageProvider.getCreatedTariffsForDateTimeInterval(fromDate, nowISOString);
        const storageCreatedPrepaidTariffs = storageCreatedTariffs.filter(x => this.isPrepaidType(x.type as number as TariffType));
        const createdPrepaidTariffsCount = storageCreatedPrepaidTariffs.length;
        const createdPrepaidTariffsTotal = storageCreatedPrepaidTariffs.reduce((acc, tariff) => this.roundAmount(acc + tariff.price), 0);
        for (const storageCreatedPrepaidTariff of storageCreatedPrepaidTariffs) {
            const userId = storageCreatedPrepaidTariff.created_by_user_id!;
            const mapItem = userWithTotalAndCountCompletedMap.get(userId);
            if (mapItem === undefined) {
                const userWithTotalAndCount: UserWithTotalAndCount = {
                    count: 1,
                    total: storageCreatedPrepaidTariff.price,
                    username: allUsersMap.get(userId!)?.username || '',
                };
                userWithTotalAndCountCompletedMap.set(userId, userWithTotalAndCount);
            } else {
                mapItem.count++;
                mapItem.total = this.roundAmount(mapItem.total + storageCreatedPrepaidTariff.price);
            }
        }

        // Recharged tariffs
        const storageRechargedTariffs = await this.storageProvider.getRechargedTariffsForDateTimeInterval(fromDate, nowISOString);
        const rechargedPrepaidTariffsCount = storageRechargedTariffs.length;
        const rechargedPrepaidTariffsTotal = storageRechargedTariffs.reduce((acc, tariff) => this.roundAmount(acc + tariff.recharge_price), 0);
        for (const storageRechargedTariff of storageRechargedTariffs) {
            const userId = storageRechargedTariff.user_id;
            const mapItem = userWithTotalAndCountCompletedMap.get(userId);
            if (mapItem === undefined) {
                const userWithTotalAndCount: UserWithTotalAndCount = {
                    count: 1,
                    total: storageRechargedTariff.recharge_price,
                    username: allUsersMap.get(userId!)?.username || '',
                };
                userWithTotalAndCountCompletedMap.set(userId, userWithTotalAndCount);
            } else {
                mapItem.count++;
                mapItem.total = this.roundAmount(mapItem.total + storageRechargedTariff.recharge_price);
            }
        }

        // Current started device statuses with continuations started for non-prepaid tariff
        const storageAllDeviceStatusesWithContinuation = await this.storageProvider.getAllDeviceStatusesWithContinuationData();
        const storageStartedDeviceStatuses = storageAllDeviceStatusesWithContinuation.filter(x => x.started);
        const nonPrepaidTariffsIdsSet = new Set<number>(allTariffs.filter(x => !this.isPrepaidType(x.type)).map(x => x.id));
        // const storageStartedDeviceStatusesForNonPrepaidTariffs = storageStartedDeviceStatuses.filter(x => nonPrepaidTariffsIdsSet.has(x.start_reason!));
        // Running sessions count will include started device on all tariffs
        // while the running sessions total will include only devices started for non-prepaid tariffs
        const runningSessionsCount = storageStartedDeviceStatuses.length;
        let runningSessionsTotal = 0;
        let continuationsCount = 0;
        let continuationsTotal = 0;
        for (const startedDevice of storageStartedDeviceStatuses) {
            const userId = startedDevice.started_by_user_id;
            const isPrepaidTariff = !nonPrepaidTariffsIdsSet.has(startedDevice.start_reason!);
            const username = isPrepaidTariff ? '' : (allUsersMap.get(userId!)?.username || '');
            const startedDeviceTotal = isPrepaidTariff ? 0 : (startedDevice.total || 0);
            runningSessionsTotal = this.roundAmount(runningSessionsTotal + startedDeviceTotal);
            let mapItem = userWithTotalAndCountRunningMap.get(userId);
            if (mapItem === undefined) {
                mapItem = {
                    count: 1,
                    total: startedDeviceTotal,
                    username: username,
                };
                userWithTotalAndCountRunningMap.set(userId, mapItem);
            } else {
                mapItem.count++;
                mapItem.total = this.roundAmount(mapItem.total + startedDeviceTotal);
            }
            if (startedDevice.continuation_tariff_id) {
                const continuationTariff = allTariffs.find(x => x.id === startedDevice.continuation_tariff_id)!;
                continuationsTotal = this.roundAmount(continuationsTotal + continuationTariff.price);
                continuationsCount++;
                const continuationUserId = startedDevice.continuation_user_id!;
                const continuationUsername = allUsersMap.get(continuationUserId)?.username;
                const continuationMapItem = userWithTotalAndCountRunningMap.get(continuationUserId);
                if (continuationMapItem == undefined) {
                    mapItem = {
                        count: 1,
                        total: continuationTariff.price,
                        username: continuationUsername!,
                    };
                    userWithTotalAndCountRunningMap.set(continuationUserId, mapItem);
                } else {
                    mapItem.count++;
                    mapItem.total = this.roundAmount(mapItem.total + continuationTariff.price);
                }
            }
        }

        const totalAmount = this.roundAmount(
            storageCompletedSessionsSummary.total
            + continuationsTotal
            + runningSessionsTotal
            + createdPrepaidTariffsTotal
            + rechargedPrepaidTariffsTotal
        );
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
            completedTotal: this.roundAmount(storageCompletedSessionsSummary.total + createdPrepaidTariffsTotal + rechargedPrepaidTariffsTotal),
            runningTotal: this.roundAmount(runningSessionsTotal + continuationsTotal),
            completedSummaryByUser: Array.from(userWithTotalAndCountCompletedMap.values()),
            runningSummaryByUser: Array.from(userWithTotalAndCountRunningMap.values()),
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
            this.setErrorToReplyMessage(err, message, replyMsg);
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
            await this.storageProvider.updateTariffPasswordHash(tariff.id, message.body.newPasswordHash);
            this.publishToDevicesChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusChangePrepaidTariffPasswordByCustomerRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
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
            this.setErrorToReplyMessage(err, message, replyMsg);
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
            this.setErrorToReplyMessage(err, message, replyMsg);
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
                    description: `User ${user.username} is not active`,
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
            storageDeviceContinuation.requested_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdDeviceContinuation = await this.storageProvider.createDeviceContinuation(storageDeviceContinuation);
            const replyDeviceContinuation = this.entityConverter.toDeviceContinuation(createdDeviceContinuation);
            replyDeviceContinuation.requestedAt = this.dateTimeHelper.getNumberFromISOStringDateTime(createdDeviceContinuation.requested_at)!;
            // TODO: Refresh only this device status
            await this.refreshDeviceStatuses();
            replyMsg.body.deviceContinuation = replyDeviceContinuation;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusCreateDeviceContinuationRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    getExpectedEndAt(tariff: Tariff, startedAt: number): number | null | undefined {
        switch (tariff.type) {
            case TariffType.duration: {
                const tariffDurationMs = tariff.duration! * 60 * 1000;
                const expectedEndAt = startedAt + tariffDurationMs;
                return expectedEndAt;
            }
            case TariffType.fromTo: {
                const res = this.dateTimeHelper.compareCurrentDateWithMinutePeriod(startedAt, tariff.fromTime!, tariff.toTime!);
                return res.expectedEndAt;
            }
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
            case TariffType.fromTo: {
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
            if (sourceDevice.disableTransfer) {
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
            if (targetDevice.disableTransfer) {
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
            const transferDeviceResult = await this.storageProvider.transferDevice(
                sourceDeviceStoreStatus.device_id,
                targetDeviceStoreStatus.device_id,
                userId,
                message.body.transferNote,
                this.dateTimeHelper.getCurrentUTCDateTimeAsISOString(),
            );
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
            this.setErrorToReplyMessage(err, message, replyMsg);
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
                // Devices stopped by customers must have null for stopped_by_user_id
                stopped_by_user_id: null,
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
            this.setErrorToReplyMessage(err, message, replyMsg);
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
            // Set device status total to the calculated total - it could be 0 because of the free time
            storageDeviceStatus.total = totalAmount;
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
            this.setErrorToReplyMessage(err, message, replyMsg);
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
                replyMsg.body.user = this.entityConverter.toUser(createdStorageUser);
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
            this.setErrorToReplyMessage(err, message, replyMsg);
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
            replyMsg.body.user = this.entityConverter.toUser(storageUser);
            replyMsg.body.roleIds = userRoleIds;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetUserWithRolesRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
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
                replyMsg.body.user = this.entityConverter.toUser(createdStorageUser);
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
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetAllUsersRequestMessage(message: BusGetAllUsersRequestMessage): Promise<void> {
        const replyMsg = createBusGetAllUsersReplyMessage();
        try {
            const allStorageUsers = await this.storageProvider.getAllUsers();
            const allUsers = allStorageUsers.map(x => this.entityConverter.toUser(x));
            replyMsg.body.users = allUsers;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetAllUsersRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
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
            this.setErrorToReplyMessage(err, message, replyMsg);
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
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetAllPermissionsRequestMessage(message: BusGetAllPermissionsRequestMessage): Promise<void> {
        const replyMsg = createBusGetAllPermissionsReplyMessage();
        try {
            const allPermissions = await this.cacheHelper.getAllPermissions();
            replyMsg.body.permissions = allPermissions!;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetAllPermissionsRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
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
            replyMsg.body.allPermissions = allPermissions!;
            replyMsg.body.rolePermissionIds = rolePermissionIds;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetRoleWithPermissionsRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
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
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusStartDeviceOnPrepaidTariffByCustomerRequestMessage(message: BusStartDeviceOnPrepaidTariffByCustomerRequestMessage): Promise<void> {
        const replyMsg = createBusStartDeviceOnPrepaidTariffByCustomerReplyMessage();
        try {
            if (message.body.passwordHash && !message.body.deviceId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceIdIsRequired,
                    description: 'Device Id is required',
                }];
                replyMsg.body.notAllowed = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            if (message.body.passwordHash && !message.body.tariffId) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIdIsRequired,
                    description: 'Tariff Id is required',
                }];
                replyMsg.body.notAllowed = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            if (message.body.passwordHash && message.body.token) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.specifyEitherPasswordOrTokenButNotBoth,
                    description: 'Specify either password or token but not both',
                }];
                replyMsg.body.notAllowed = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            if (message.body.passwordHash) {
                const passwordMatches = await this.storageProvider.checkTariffPasswordHash(message.body.tariffId!, message.body.passwordHash);
                if (!passwordMatches) {
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.passwordDoesNotMatch,
                        description: 'Password does not match',
                    }];
                    replyMsg.body.passwordDoesNotMatch = true;
                    this.publishToDevicesChannel(replyMsg, message);
                    return;
                }
            }
            let storageLongLivedAccessToken: ILongLivedAccessToken | undefined;
            if (message.body.token) {
                storageLongLivedAccessToken = await this.storageProvider.getLongLivedAccessToken(message.body.token);
                if (!storageLongLivedAccessToken || new Date() > new Date(storageLongLivedAccessToken.valid_to)) {
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.tokenNotFound,
                        description: 'Token is not found or is expired',
                    }];
                    replyMsg.body.passwordDoesNotMatch = true;
                    this.publishToDevicesChannel(replyMsg, message);
                    return;
                }
            }

            const currentStorageDeviceStatus = await this.storageProvider.getDeviceStatus(message.body.deviceId);
            if (!currentStorageDeviceStatus || currentStorageDeviceStatus.started) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.deviceAlreadyStarted,
                    description: 'Selected device is already started',
                }];
                replyMsg.body.alreadyInUse = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            const tariffId = storageLongLivedAccessToken ? storageLongLivedAccessToken.tariff_id! : message.body.tariffId;
            const allTariffs = await this.getOrCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === tariffId)!;
            if (!tariff) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffNotFound,
                    description: 'Selected tariff is not found',
                }];
                replyMsg.body.notAllowed = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            if (!this.isPrepaidType(tariff.type)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.prepaidTariffIsRequired,
                    description: 'Selected tariff is not of prepaid type',
                }];
                replyMsg.body.notAllowed = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            if (!tariff.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIsNotActive,
                    description: 'Selected tariff is not active',
                }];
                replyMsg.body.notAllowed = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            const hasRemainingSeconds = !!(tariff.remainingSeconds! > 0);
            if (!hasRemainingSeconds) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.noRemainingTimeLeft,
                    description: `The tariff '${tariff.name}' has no time remaining`,
                }];
                replyMsg.body.noRemainingTime = true;
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
                replyMsg.header.errors = [{
                    code: BusErrorCode.prepaidTariffAlreadyInUse,
                    description: `The tariff Id ${tariff.id} ('${tariff.name}') is already in use by device Id ${firstDeviceStartedForTariff.device_id} '(${device?.name})'`,
                }];
                replyMsg.body.alreadyInUse = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            const isTariffAvailable = await this.isTariffAvailableForDevice(
                message.body.deviceId,
                tariff.id,
                allTariffs,
            );
            if (!isTariffAvailable) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tariffIsNotAvailable,
                    description: `The tariff Id ${tariff.id} ('${tariff.name}') is not available for the device`,
                }];
                replyMsg.body.notAvailableForThisDeviceGroup = true;
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }

            currentStorageDeviceStatus.enabled = true;
            currentStorageDeviceStatus.start_reason = tariff.id;
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
            replyMsg.body.tariffId = tariff.id;
            this.publishToDevicesChannel(replyMsg, message);
            if (replyMsg.body.success && storageLongLivedAccessToken) {
                // Reresh long lived access token valid_to
                await this.extendValidToOfLongLivedAccessToken(storageLongLivedAccessToken.id);
                // If token is used, save usage history
                try {
                    const storageLongLivedAccessTokenUsage: ILongLivedAccessTokenUsage = {
                        token: message.body.token,
                        used_at: this.dateTimeHelper.getCurrentUTCDateTimeAsISOString(),
                        device_id: message.body.deviceId,
                        tariff_id: storageLongLivedAccessToken.tariff_id,
                        user_id: storageLongLivedAccessToken.user_id,
                        ip_address: message.body.ipAddress,
                        valid_to: storageLongLivedAccessToken.valid_to,
                    } as ILongLivedAccessTokenUsage;
                    await this.storageProvider.addLongLivedAccessTokenUsage(storageLongLivedAccessTokenUsage);
                } catch (err) {
                    this.logger.warn('Cannot save long lived access token usage', err);
                }
            }
        } catch (err) {
            this.logger.warn(`Can't process BusStartDeviceRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
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
        const replyMsg = createBusStartDeviceReplyMessage();
        try {
            if (!(message.body.userId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.userIdIsRequired, description: 'User Id is required to start device' },
                ];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const currentStorageDeviceStatus = (await this.storageProvider.getDeviceStatus(message.body.deviceId))!;
            if (currentStorageDeviceStatus.started) {
                // Already started
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.deviceAlreadyStarted, description: 'Selected device is already started' },
                ];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            const allTariffs = await this.getOrCacheAllTariffs();
            const tariff = allTariffs.find(x => x.id === message.body.tariffId)!;
            if (!tariff) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.tariffNotFound, description: 'Selected tariff is not found' },
                ];
                this.publishToDevicesChannel(replyMsg, message);
                return;
            }
            if (!tariff.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [
                    { code: BusErrorCode.tariffIsNotActive, description: `Specified tariff is not active` },
                ];
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
                if (!isCurrentMinuteInPeriodResult.isInPeriod) {
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [
                        { code: BusErrorCode.cantUseTheTariffNow, description: `Can't use the tariff right now` },
                    ];
                    this.publishToOperatorsChannel(replyMsg, message);
                    return;
                }
            }

            if (this.isPrepaidType(tariff.type)) {
                const hasRemainingSeconds = !!(tariff.remainingSeconds! > 0);
                if (!hasRemainingSeconds) {
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [
                        { code: BusErrorCode.noRemainingTimeLeft, description: `The tariff '${tariff.name}' has no time remaining` },
                    ];
                    this.publishToOperatorsChannel(replyMsg, message);
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
                    this.publishToOperatorsChannel(replyMsg, message);
                    return;
                }
            }

            if (tariff.type === TariffType.duration) {
                if (tariff.restrictStartTime) {
                    const isCurrentMinuteInPeriodResult = this.dateTimeHelper.isCurrentMinuteInMinutePeriod(tariff.restrictStartFromTime!, tariff.restrictStartToTime!);
                    if (!isCurrentMinuteInPeriodResult.isInPeriod) {
                        replyMsg.header.failure = true;
                        replyMsg.header.errors = [
                            { code: BusErrorCode.cantStartTheTariffNow, description: `Can't start the tariff right now` },
                        ];
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
            replyMsg.body.deviceStatus = this.createAndCalculateDeviceStatusFromStorageDeviceStatus(currentStorageDeviceStatus, tariff);
            await this.refreshDeviceStatuses();
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusStartDeviceRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusUpdateTariffRequestMessage(message: BusUpdateTariffRequestMessage): Promise<void> {
        const replyMsg = createBusUpdateTariffReplyMessage();
        try {
            if (!(message.body.userId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: `User Id is required`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
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
            if (message.body.deviceGroupIds) {
                const hasInvalidDeviceGroupId = message.body.deviceGroupIds.some(x => !(x > 0));
                if (hasInvalidDeviceGroupId) {
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.deviceGroupNotFound,
                        description: `Device group id is invalid`,
                    }];
                    this.publishToOperatorsChannel(replyMsg, message);
                    return;
                }
            }
            const storageTariff = this.entityConverter.toStorageTariff(tariff);
            storageTariff.updated_by_user_id = message.body.userId;
            storageTariff.updated_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const updatedTariff = await this.storageProvider.updateTariff(storageTariff, message.body.passwordHash, message.body.deviceGroupIds);
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
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToSharedChannel(replyMsg, message);
        }
    }

    async processBusGetTariffByIdRequestMessage(message: BusGetTariffByIdRequestMessage): Promise<void> {
        const replyMsg = createBusGetTariffByIdReplyMessage();
        try {
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
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusCreatePrepaidTariffRequestMessage(message: BusCreatePrepaidTariffRequestMessage): Promise<void> {
        const replyMsg = createBusCreatePrepaidTariffReplyMessage();
        try {
            if (!(message.body.userId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: `User Id is required`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            if (message.body.deviceGroupIds) {
                const hasInvalidDeviceGroupId = message.body.deviceGroupIds.some(x => !(x > 0));
                if (hasInvalidDeviceGroupId) {
                    replyMsg.header.failure = true;
                    replyMsg.header.errors = [{
                        code: BusErrorCode.deviceGroupNotFound,
                        description: `Device group id is invalid`,
                    }];
                    this.publishToOperatorsChannel(replyMsg, message);
                    return;
                }
            }
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
            tariffToCreate.createdByUserId = message.body.userId;
            const storageTariffToCreate = this.entityConverter.toStorageTariff(tariffToCreate);
            storageTariffToCreate.created_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdStorageTariff = await this.storageProvider.createTariff(storageTariffToCreate, message.body.passwordHash, message.body.deviceGroupIds);
            if (!createdStorageTariff) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.serverError,
                    description: `Can't create prepaid tariff`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            await this.cacheAllTariffs();
            const createdTariff = this.entityConverter.toTariff(createdStorageTariff);
            replyMsg.body.tariff = createdTariff;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusCreatePrepaidTariffRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusCreateTariffRequestMessage(message: BusCreateTariffRequestMessage): Promise<void> {
        const replyMsg = createBusCreateTariffReplyMessage();
        try {
            if (!(message.body.userId > 0)) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIdIsRequired,
                    description: `User Id is required`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
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
            tariffToCreate.createdByUserId = message.body.userId;
            const storageTariffToCreate = this.entityConverter.toStorageTariff(tariffToCreate);
            storageTariffToCreate.created_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
            const createdStorageTariff = await this.storageProvider.createTariff(storageTariffToCreate, null, message.body.deviceGroupIds);
            if (!createdStorageTariff) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.serverError,
                    description: `Can't create tariff`,
                }];
                this.publishToOperatorsChannel(replyMsg, message);
                return;
            }
            await this.cacheAllTariffs();
            const createdTariff = this.entityConverter.toTariff(createdStorageTariff);
            replyMsg.body.tariff = createdTariff;
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusCreateTariffRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetAllTariffsRequestMessage(message: BusGetAllTariffsRequestMessage): Promise<void> {
        const replyMsg = createBusGetAllTariffsReplyMessage();
        try {
            const allTariffs = await this.storageProvider.getAllTariffs(message.body.types);
            replyMsg.body.tariffs = allTariffs.map(tariff => this.entityConverter.toTariff(tariff));
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusGetAllTariffsRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusUpdateDeviceRequest(message: BusUpdateDeviceRequestMessage): Promise<void> {
        const replyMsg = createBusUpdateDeviceReplyMessage();
        try {
            if (!message.body.device?.id) {
                this.logger.warn(`Can't update device without id`, message);
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
            replyMsg.body.device = updatedStorageDevice && this.entityConverter.toDevice(updatedStorageDevice);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusUpdateDeviceRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetDeviceByIdRequest(message: BusDeviceGetByIdRequestMessage): Promise<void> {
        const replyMsg = createBusDeviceGetByIdReplyMessage();
        try {
            const device = await this.storageProvider.getDeviceById(message.body.deviceId);
            replyMsg.body.device = device && this.entityConverter.toDevice(device);
            this.publishToOperatorsChannel(replyMsg, message);
        } catch (err) {
            this.logger.warn(`Can't process BusDeviceGetByIdRequestMessage message`, message, err);
            this.setErrorToReplyMessage(err, message, replyMsg);
            this.publishToOperatorsChannel(replyMsg, message);
        }
    }

    async processBusGetAllDevicesRequest(message: BusGetAllDevicesRequestMessage): Promise<void> {
        const storageDevices = await this.storageProvider.getAllDevices();
        const replyMsg = createBusOperatorGetAllDevicesReplyMessage();
        replyMsg.body.devices = storageDevices.map(storageDevice => this.entityConverter.toDevice(storageDevice));
        this.publishToOperatorsChannel(replyMsg, message);
    }

    async processBusUserConnectionEventNotification(message: BusOperatorConnectionEventNotificationMessage): Promise<void> {
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

    async processBusUserAuthRequest(message: BusUserAuthRequestMessage): Promise<void> {
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
            const replyMsg = await this.getBusUserAuthReplyMessageForUsernameAndPasswordHash(body.username!, body.passwordHash!);
            // if (replyMsg.body.success) {
            //     await this.maintainUserAuthDataTokenCacheItem(replyMsg.body.userId!, replyMsg.body.permissions!, replyMsg.body.token!, rtData);
            // }
            this.publishToOperatorsChannel(replyMsg, message);
            // }
        } catch (err) {
            this.logger.warn(`Can't process BusOperatorAuthRequestMessage`, message, err);
            const replyMsg = createBusUserAuthReplyMessage();
            this.setErrorToReplyMessage(err, message, replyMsg);
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

    async processDeviceConnectionEventMessage(message: BusDeviceConnectionEventNotificationMessage): Promise<void> {
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

    async getBusUserAuthReplyMessageForLongLivedAccessToken(token: string): Promise<BusUserAuthReplyMessage> {
        const replyMsg = createBusUserAuthReplyMessage();
        try {
            const storageLongLivedToken = await this.storageProvider.getLongLivedAccessToken(token);
            if (!storageLongLivedToken || !storageLongLivedToken.user_id) {
                replyMsg.body.success = false;
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tokenNotFound,
                    description: 'Token not found',
                }] as MessageError[];
                return replyMsg;
            }
            const hasExpired = Date.now() > new Date(storageLongLivedToken.valid_to).getTime();
            if (hasExpired) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.tokenExpired,
                    description: 'The specified token has expired',
                }];
                replyMsg.body.success = false;
                return replyMsg;
            }
            const user = await this.storageProvider.getUserById(storageLongLivedToken.user_id!);
            if (!user || !user.enabled) {
                replyMsg.header.failure = true;
                replyMsg.header.errors = [{
                    code: BusErrorCode.userIsNotActive,
                    description: 'The specified user is not active',
                }];
                replyMsg.body.success = false;
                return replyMsg;
            }

            replyMsg.body.success = true;
            replyMsg.body.userId = storageLongLivedToken.user_id;
            replyMsg.body.permissions = await this.storageProvider.getUserPermissions(user.id);
            replyMsg.body.username = user.username;
            replyMsg.body.longLivedAccessToken = this.entityConverter.toLongLivedAccessToken(storageLongLivedToken);
            return replyMsg;
        } catch (err) {
            this.logger.warn(`Can't process getBusUserAuthReplyMessageForLongLivedToken message`, err);
            replyMsg.body.success = false;
            return replyMsg;
        }
    }

    async getBusUserAuthReplyMessageForUsernameAndPasswordHash(username: string, passwordHash: string): Promise<BusUserAuthReplyMessage> {
        const replyMsg = createBusUserAuthReplyMessage();
        const user = await this.storageProvider.getUserByUsernameAndPasswordHash(username, passwordHash);
        if (!user) {
            // TODO: Send "credentials are invalid"
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: BusErrorCode.userNotFound,
                description: 'User not found',
            }];
        } else if (!user.enabled) {
            // TODO: Send "User not enabled"
            const replyMsg = createBusUserAuthReplyMessage();
            replyMsg.body.success = false;
            replyMsg.body.username = user.username;
            replyMsg.body.userId = user.id;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: BusErrorCode.userIsNotActive,
                description: 'User is not active',
            }];
        } else {
            // User with such username and password is found and is enabled
            const permissions = await this.storageProvider.getUserPermissions(user.id);
            replyMsg.body.success = true;
            replyMsg.body.userId = user.id;
            replyMsg.body.permissions = permissions;
            replyMsg.body.username = user.username;
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
            };
            // Create record in device statuses database table
            await this.storageProvider.addOrUpdateDeviceStatusEnabled(storageDeviceStatus);
            this.logger.log(`New device created. Device Id ${createdDevice.id}`);
            await this.cacheAllDevices();
        } catch (err) {
            this.logger.warn(`Can't process BusDeviceUnknownDeviceConnectedRequestMessage message`, message, err);
        }
    }

    private getUserValidationMessageErrors(user: User, idRequired = false): MessageError[] | undefined {
        let result: MessageError[] | undefined;
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

    private getRoleValidationMessageErrors(role: Role, idRequired = false): MessageError[] | undefined {
        let result: MessageError[] | undefined;
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

    deserializeToMessage(text: string): Message<unknown> | null {
        const json = JSON.parse(text);
        return json as Message<unknown>;
    }

    isOwnMessage<TBody>(message: Message<TBody>): boolean {
        return (message.header?.source === this.messageBusIdentifier);
    }

    async publishToOperatorsChannel<TBody>(message: Message<TBody>, sourceMessage?: Message<unknown>): Promise<number> {
        if (sourceMessage) {
            // Transfer source message common data (like round trip data) to destination message
            transferSharedMessageData(message, sourceMessage);
        }
        return this.publishMessage(ChannelName.operators, message);
    }

    async publishToDevicesChannel<TBody>(message: Message<TBody>, sourceMessage?: Message<unknown>): Promise<number> {
        if (sourceMessage) {
            // Transfer source message common data (like round trip data) to destination message
            transferSharedMessageData(message, sourceMessage);
        }
        return this.publishMessage(ChannelName.devices, message);
    }

    async publishToSharedChannel<TBody>(message: Message<TBody>, sourceMessage: Message<unknown> | null): Promise<number> {
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
            this.logger.log(`Publishing message ${channelName} ${message.header.type}`, message);
            message.header.source = this.messageBusIdentifier;
            return await this.pubClient.publish(channelName, this.serializeMessage(message));
        } catch (err) {
            this.logger.error(`Cannot sent message to channel ${channelName} ${message.header.type}`, message, err);
            return -1;
        }
    };

    private mainTimerCallback(): void {
        const now = this.dateTimeHelper.getCurrentDateTimeAsNumber();
        this.checkForRefreshDeviceStatuses(now);
        this.manageLogFiltering(now);
    }

    async extendValidToOfLongLivedAccessToken(longLivedAccessTokenId: number): Promise<void> {
        const now = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
        const newValidTo = this.dateTimeHelper.addSeconds(now, this.state.longLivedTokenDurationSeconds);
        try {
            await this.storageProvider.updateLongLivedTokenValidTo(longLivedAccessTokenId, newValidTo);
        } catch (err) {
            this.logger.error(`Can't change long lived token valid to value to ${newValidTo}`, err);
        }
    }

    manageLogFiltering(now: number): void {
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

    private checkForRefreshDeviceStatuses(now: number): void {
        if (this.state.deviceStatusRefreshInProgress) {
            return;
        }
        const diff = now - this.state.lastDeviceStatusRefreshAt;
        if (diff > this.state.systemSettings[SystemSettingsName.device_status_refresh_interval]) {
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
            const allTariffsMap = new Map<number, Tariff>(allTariffs.map(x => ([x.id, x])));
            const allDevices = await this.getOrCacheAllDevices();
            // const allDevicesMap = new Map<number, Device>(allDevices.map(x => ([x.id, x])));
            // TODO: We will process only enabled devices
            //       If the user disables device while it is started (the system should prevent this),
            //       it will not be processed here and will remain started until enabled again
            const enabledDevices = allDevices.filter(x => x.approved && x.enabled);
            const deviceStatuses: DeviceStatus[] = [];
            for (const enabledDevice of enabledDevices) {
                const storageDeviceStatus = storageDeviceStatusesWithContinuationData.find(x => x.device_id === enabledDevice.id);
                if (storageDeviceStatus) {
                    // const tariff = allTariffs.find(x => x.id === storageDeviceStatus.start_reason)!;
                    const tariff = allTariffsMap.get(storageDeviceStatus.start_reason!)!;
                    let calculatedDeviceStatus = this.createAndCalculateDeviceStatusFromStorageDeviceStatus(storageDeviceStatus, tariff);
                    const originalCalculatedDeviceStatus = calculatedDeviceStatus;
                    if (storageDeviceStatus.started && !calculatedDeviceStatus.started) {
                        // After the calculation, if device was started but no longer, it must be stopped
                        storageDeviceStatus.started = calculatedDeviceStatus.started;
                        storageDeviceStatus.stopped_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
                        // Automatic stops are saved with user id null (the system)
                        storageDeviceStatus.stopped_by_user_id = null;
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
                            // The computer is stopped automatically - the record must have user id null for stopped_by_user_id
                            stopped_by_user_id: null,
                            started_by_customer: !storageDeviceStatus.started_by_user_id,
                            // This will always be false, because the system is stopping the computer
                            stopped_by_customer: false,
                            note: storageDeviceSessionNote,
                        } as IDeviceSession;
                        // TODO: If the continuation is configured but the tariff cannot be used right now - send notification message
                        // See if we need to switch to another tariff
                        // let shouldPerformContinuation = false;
                        if (shouldStartForContinuationTariffResult.shouldStart && continuationTariff) {
                            storageDeviceStatus.enabled = true;
                            storageDeviceStatus.start_reason = continuationTariff.id;
                            storageDeviceStatus.started = true;
                            storageDeviceStatus.started_at = this.dateTimeHelper.getCurrentUTCDateTimeAsISOString();
                            storageDeviceStatus.stopped_at = null;
                            storageDeviceStatus.total = continuationTariff.price;
                            storageDeviceStatus.started_by_user_id = storageDeviceStatus.continuation_user_id;
                            storageDeviceStatus.stopped_by_user_id = null;
                            // shouldPerformContinuation = true;
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
                    // Device status for this device is not found - consider it is in the default status
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
            const deviceStatusesMsg = createBusDeviceStatusesNotificationMessage();
            deviceStatusesMsg.body.deviceStatuses = deviceStatuses;
            const continuationTariffIds = deviceStatuses.filter(x => x.continuationTariffId).map(x => x.continuationTariffId);
            if (continuationTariffIds.length > 0) {
                const continuationTariffShortInfos: TariffShortInfo[] = [];
                for (const tariffId of continuationTariffIds) {
                    const tariff = allTariffsMap.get(tariffId!)!;
                    const tariffShortInfo: TariffShortInfo = {
                        id: tariff.id,
                        name: tariff.name,
                        duration: tariff.duration,
                    };
                    continuationTariffShortInfos.push(tariffShortInfo);
                }
                deviceStatusesMsg.body.continuationTariffShortInfos = continuationTariffShortInfos;
            }
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
            deviceId: storageDeviceContinuation.device_id,
            requestedAt: this.dateTimeHelper.getNumberFromISOStringDateTime(storageDeviceContinuation.requested_at)!,
            tariffId: storageDeviceContinuation.tariff_id,
            userId: storageDeviceContinuation.user_id,
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
            note: storageDeviceStatusWithContinuationData.note,
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
            this.logger.error(`The environment variable ${this.envVars.CCS3_STATE_MANAGER_STORAGE_CONNECTION_STRING.name} value is empty`);
            return false;
        }
        this.storageProvider = this.createStorageProvider();
        const storageProviderConfig: StorageProviderConfig = {
            // adminConnectionString: undefined,
            connectionString: storageProviderConnectionString,
            databaseMigrationsPath: './postgre-storage/database-migrations',
        };
        const initRes = await this.storageProvider.init(storageProviderConfig);
        return initRes.success;
    }

    private createStorageProvider(): StorageProvider {
        return new PostgreStorageProvider();
    }

    private createDefaultState(): StateManagerState {
        const qrCodeSignInTokenDurationDays = 30;
        const state: StateManagerState = {
            systemSettings: {
                [SystemSettingsName.device_status_refresh_interval]: 5 * 1000,
                // 1800 seconds = 30 minutes
                [SystemSettingsName.token_duration]: 1800 * 1000,
                // Empty timezsone means the current computer timezone will be used
                [SystemSettingsName.timezone]: '',
                [SystemSettingsName.free_seconds_at_start]: 180,
                [SystemSettingsName.seconds_before_restarting_stopped_computers]: 120,
                [SystemSettingsName.seconds_before_notifying_customers_for_session_end]: 0,
                [SystemSettingsName.feature_qrcode_sign_in_enabled]: false,
                [SystemSettingsName.feature_qrcode_sign_in_server_public_url]: '',
                [SystemSettingsName.feature_qrcode_sign_in_token_duration]: qrCodeSignInTokenDurationDays,
            },
            lastDeviceStatusRefreshAt: 0,
            deviceStatusRefreshInProgress: false,
            mainTimerHandle: undefined,
            // 5 minutes
            codeSignInDurationSeconds: 5 * 60,
            longLivedTokenDurationSeconds: qrCodeSignInTokenDurationDays * 24 * 60 * 60,
        };
        return state;
    }

    private async loadSystemSettings(): Promise<ISystemSetting[]> {
        const allSystemSettings = await this.storageProvider.getAllSystemSettings();
        const settingsMap = new Map<string, ISystemSetting>();
        allSystemSettings.forEach(x => settingsMap.set(x.name, x));
        const getAsNumber = (name: SystemSettingsName) => +(settingsMap.get(name)?.value || 0);
        const getAsBoolean = (name: SystemSettingsName) => settingsMap.get(name)?.value?.trim()?.toLowerCase() === 'yes';
        this.state.systemSettings = {
            [SystemSettingsName.device_status_refresh_interval]: 1000 * getAsNumber(SystemSettingsName.device_status_refresh_interval),
            [SystemSettingsName.token_duration]: 1000 * getAsNumber(SystemSettingsName.token_duration),
            [SystemSettingsName.free_seconds_at_start]: getAsNumber(SystemSettingsName.free_seconds_at_start),
            [SystemSettingsName.timezone]: settingsMap.get(SystemSettingsName.timezone)?.value,
            [SystemSettingsName.seconds_before_restarting_stopped_computers]: getAsNumber(SystemSettingsName.seconds_before_restarting_stopped_computers),
            [SystemSettingsName.seconds_before_notifying_customers_for_session_end]: getAsNumber(SystemSettingsName.seconds_before_notifying_customers_for_session_end),
            [SystemSettingsName.feature_qrcode_sign_in_enabled]: getAsBoolean(SystemSettingsName.feature_qrcode_sign_in_enabled),
            [SystemSettingsName.feature_qrcode_sign_in_server_public_url]: settingsMap.get(SystemSettingsName.feature_qrcode_sign_in_server_public_url)?.value,
            [SystemSettingsName.feature_qrcode_sign_in_token_duration]: getAsNumber(SystemSettingsName.feature_qrcode_sign_in_token_duration),
        };
        return allSystemSettings;
    }

    private applySystemSettings(): void {
        // Some of the system settings need to be applied to other entities when they are changed,
        // not just set to this.state.systemSettings
        this.applySystemSettingTimeZone();
        this.applySystemSettingLongLivedTokenDuration();
    }

    getFreeSecondsAtComputerSessionStart(): number {
        return this.state.systemSettings[SystemSettingsName.free_seconds_at_start];
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
        const databaseIntialized = await this.setupDatabase();
        if (!databaseIntialized) {
            return false;
        }
        const storageSystemSettings = await this.loadSystemSettings();
        this.applySystemSettings();

        // TODO: Should we publish system settings to the shared channel ? They can contain sensitive information

        const redisHost = this.envVars.CCS3_REDIS_HOST.value;
        const redisPort = this.envVars.CCS3_REDIS_PORT.value;
        this.logger.log(`Using Redis host ${redisHost} and port ${redisPort}`);

        await this.connectCacheClient(redisHost, redisPort);
        await this.cacheStaticData();
        await this.connectPubClient(redisHost, redisPort);
        await this.connectSubClient(redisHost, redisPort);

        const notificationMsg = createBusAllSystemSettingsNotificationMessage();
        const systemSettings = storageSystemSettings.map(x => this.entityConverter.toSystemSetting(x));
        notificationMsg.body.systemSettings = systemSettings;
        this.publishToSharedChannel(notificationMsg, null);

        this.state.mainTimerHandle = setInterval(() => this.mainTimerCallback(), 1000);

        return true;
    }

    async setupDatabase(): Promise<boolean> {
        const maxDatabaseInitializationTries = 20;
        let currentDatabaseInitializationTry = 0;
        let databaseInitialized = false;
        const delayBetweenDatabaseInitializationTries = 5000;
        while (currentDatabaseInitializationTry < maxDatabaseInitializationTries) {
            currentDatabaseInitializationTry++;
            try {
                databaseInitialized = await this.initializeDatabase();
                if (databaseInitialized) {
                    break;
                } else {
                    this.logger.warn(`The database cannot be initialized. Try ${currentDatabaseInitializationTry} / ${maxDatabaseInitializationTries}`);
                    if (currentDatabaseInitializationTry < maxDatabaseInitializationTries) {
                        await this.delay(delayBetweenDatabaseInitializationTries);
                    } else {
                        break;
                    }
                }
            } catch (err) {
                this.logger.warn('Cannot initialize the database', err);
            }
        }
        return databaseInitialized;
    }

    async connectCacheClient(redisHost: string, redisPort: number): Promise<void> {
        const redisCacheClientOptions: CreateConnectedRedisClientOptions = {
            host: redisHost,
            port: redisPort,
            errorCallback: err => console.error('CacheClient error', err),
            reconnectStrategyCallback: (retries: number, err: Error) => {
                console.error(`CacheClient reconnect strategy error ${retries}`, err);
                return 5000;
            },
        };
        this.logger.log('CacheClient connecting');
        await this.cacheClient.connect(redisCacheClientOptions);
        this.logger.log('CacheClient connected');
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
        this.logger.log('PubClient connecting');
        await this.pubClient.connect(pubClientOptions);
        this.logger.log('PubClient connected');
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
                const messageJson = this.deserializeToMessage(message);
                if (messageJson) {
                    this.processReceivedBusMessage(channelName, messageJson);
                } else {
                    this.logger.warn('The message deserialized to null', message);
                }
            } catch (err) {
                this.logger.warn(`Cannot deserialize channel ${channelName} message`, message, err);
            }
        };
        await this.subClient.connect(subClientOptions, subClientMessageCallback);
        this.logger.log('SubClient connected');
        await this.subClient.subscribe(ChannelName.shared);
        await this.subClient.subscribe(ChannelName.devices);
        await this.subClient.subscribe(ChannelName.operators);
    }

    applySystemSettingLongLivedTokenDuration(): void {
        // Long lived access token duration
        const longLivedTokenDurationDays = this.state.systemSettings[SystemSettingsName.feature_qrcode_sign_in_token_duration];
        this.state.longLivedTokenDurationSeconds = longLivedTokenDurationDays * 24 * 60 * 60;
    }

    applySystemSettingTimeZone(): void {
        this.dateTimeHelper.setDefaultTimeZone(this.state.systemSettings[SystemSettingsName.timezone]);
    }

    setErrorToReplyMessage(err: unknown, requestMessage: Message<unknown>, replyMessage: Message<unknown>): void {
        this.logger.warn(`Can't process request message`, requestMessage, err);
        replyMessage.header.failure = true;
        replyMessage.header.errors = [{
            code: BusErrorCode.serverError,
            description: (err as Error)?.message
        }];
    }

    groupBy<TItem, TKey>(items: TItem[], keySelector: (item: TItem) => TKey): ItemsGroup<TKey, TItem>[] {
        const map = new Map<TKey, TItem[]>();
        for (const item of items) {
            const key = keySelector(item);
            const mapItem = map.get(key);
            if (!mapItem) {
                map.set(key, [item]);
            } else {
                mapItem.push((item));
            }
        }
        const result: ItemsGroup<TKey, TItem>[] = [];
        for (const mapItem of map) {
            result.push({ key: mapItem[0], items: mapItem[1] });
        }
        return result;
    }

    roundAmount(amount: number): number {
        return Math.round(amount * 100) / 100;
    }

    async delay(ms: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => resolve(), ms);
        });
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

interface ItemsGroup<TKey, TItem> {
    key: TKey;
    items: TItem[];
}

interface StateManagerState {
    systemSettings: StateManagerStateSystemSettings;
    lastDeviceStatusRefreshAt: number;
    deviceStatusRefreshInProgress: boolean;
    mainTimerHandle?: NodeJS.Timeout;
    filterLogsItem?: FilterServerLogsItem | null;
    filterLogsRequestedAt?: number | null;
    codeSignInDurationSeconds: number;
    longLivedTokenDurationSeconds: number;
}

interface StateManagerStateSystemSettings {
    [SystemSettingsName.device_status_refresh_interval]: number;
    [SystemSettingsName.token_duration]: number;
    [SystemSettingsName.timezone]: string | undefined | null;
    [SystemSettingsName.free_seconds_at_start]: number;
    [SystemSettingsName.seconds_before_restarting_stopped_computers]: number;
    [SystemSettingsName.seconds_before_notifying_customers_for_session_end]: number;
    [SystemSettingsName.feature_qrcode_sign_in_enabled]: boolean;
    [SystemSettingsName.feature_qrcode_sign_in_server_public_url]: string | undefined | null;
    [SystemSettingsName.feature_qrcode_sign_in_token_duration]: number;
}
