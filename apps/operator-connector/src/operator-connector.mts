import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { catchError, filter, finalize, first, Observable, of, timeout } from 'rxjs';

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
import { BusUserAuthReplyMessage, BusUserAuthReplyMessageBody, createBusUserAuthRequestMessage } from '@computerclubsystem/types/messages/bus/bus-operator-auth.messages.mjs';
import { createBusOperatorConnectionEventNotificatinMessage } from '@computerclubsystem/types/messages/bus/bus-operator-connection-event-notification.message.mjs';
import { createOperatorAuthReplyMessage } from '@computerclubsystem/types/messages/operators/operator-auth.messages.mjs';
import { Logger } from './logger.mjs';
import { IStaticFilesServerConfig, StaticFilesServer } from './static-files-server.mjs';
import { EnvironmentVariablesHelper } from './environment-variables-helper.mjs';
import { OperatorRequestMessage, OperatorNotificationMessage, OperatorReplyMessage } from '@computerclubsystem/types/messages/operators/declarations/operator.message.mjs';
import { OperatorRequestMessageType, OperatorNotificationMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { createOperatorConfigurationNotificationMessage, OperatorConfigurationNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-configuration-notification.message.mjs';
// import { OperatorPingRequestMessage } from '@computerclubsystem/types/messages/operators/operator-ping-request.message.mjs';
import { CacheHelper, UserAuthDataCacheValue } from './cache-helper.mjs';
import {
    CanProcessOperatorMessageResult, CanProcessOperatorMessageResultErrorReason, ConnectedClientData,
    ConnectionCleanUpReason, IsTokenActiveResult, MessageStatItem, OperatorConnectorState, OperatorConnectorValidators
} from './declarations.mjs';
import { OperatorRefreshTokenRequestMessage } from '@computerclubsystem/types/messages/operators/operator-refresh-token.messages.mjs';
import { createOperatorRefreshTokenReplyMessage } from '@computerclubsystem/types/messages/operators/operator-refresh-token.messages.mjs';
import { createOperatorNotAuthenticatedReplyMessage } from '@computerclubsystem/types/messages/operators/operator-not-authenticated-reply.message.mjs';
import { OperatorSignOutRequestMessage } from '@computerclubsystem/types/messages/operators/operator-sign-out.messages.mjs';
import { createOperatorSignOutReplyMessage } from '@computerclubsystem/types/messages/operators/operator-sign-out.messages.mjs';
import { AuthorizationHelper } from './authorization-helper.mjs';
import { OperatorGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-devices.messages.mjs';
import { createBusGetAllDevicesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-devices.messages.mjs';
import { SubjectsService } from './subjects.service.mjs';
import { createOperatorGetAllDevicesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-devices.messages.mjs';
import { BusOperatorGetAllDevicesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-devices.messages.mjs';
import { OperatorGetDeviceByIdRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-by-id.messages.mjs';
import { createBusDeviceGetByIdRequestMessage } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id.messages.mjs';
import { BusDeviceGetByIdReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-device-get-by-id.messages.mjs';
import { createOperatorGetDeviceByIdReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-by-id.messages.mjs';
import { OperatorUpdateDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-device.messages.mjs';
import { createOperatorUpdateDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-device.messages.mjs';
import { createBusUpdateDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-device.messages.mjs';
import { BusUpdateDeviceReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-update-device.messages.mjs';
import { OperatorGetAllTariffsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-tariffs.messages.mjs';
import { BusGetAllTariffsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-tariffs.messages.mjs';
import { createBusGetAllTariffsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-tariffs.messages.mjs';
import { createOperatorGetAllTariffsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-tariffs.messages.mjs';
import { OperatorCreateTariffRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-tariff.messages.mjs';
import { createOperatorCreateTariffReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-tariff.messages.mjs';
import { createBusCreateTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-tariff.messages.mjs';
import { BusCreateTariffReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-tariff.messages.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { Tariff } from '@computerclubsystem/types/entities/tariff.mjs';
import { TariffValidator } from './tariff-validator.mjs';
import { createOperatorDeviceStatusesNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-device-statuses-notification.message.mjs';
import { OperatorDeviceStatus } from '@computerclubsystem/types/entities/operator-device-status.mjs';
import { OperatorStartDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-start-device.messages.mjs';
import { createBusStartDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-start-device.messages.mjs';
import { createOperatorStartDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-start-device.messages.mjs';
import { OperatorGetDeviceStatusesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-statuses.messages.mjs';
import { createOperatorGetDeviceStatusesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-statuses.messages.mjs';
import { BusStartDeviceReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-start-device.messages.mjs';
import { OperatorGetTariffByIdRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-tariff-by-id.messages.mjs';
import { ErrorReplyHelper } from './error-reply-helper.mjs';
import { createBusGetTariffByIdRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-tariff-by-id.messages.mjs';
import { BusGetTariffByIdReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-tariff-by-id.messages.mjs';
import { createOperatorGetTariffByIdReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-tariff-by-id.messages.mjs';
import { OperatorUpdateTariffRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-tariff.messages.mjs';
import { createBusUpdateTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-tariff.messages.mjs';
import { createOperatorUpdateTariffReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-tariff.messages.mjs';
import { OperatorConnectionEventType } from '@computerclubsystem/types/entities/declarations/operator-connection-event-type.mjs';
import { OperatorGetAllRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-roles.messages.mjs';
import { BusGetAllRolesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-roles.messages.mjs';
import { createBusGetAllRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-roles.messages.mjs';
import { createOperatorGetAllRolesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-roles.messages.mjs';
import { OperatorGetRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-role-with-permissions.messages.mjs';
import { createBusGetRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-role-with-permissions.messages.mjs';
import { BusGetRoleWithPermissionsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-role-with-permissions.messages.mjs';
import { createOperatorGetRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-role-with-permissions.messages.mjs';
import { OperatorGetAllPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-permissions.messages.mjs';
import { createBusGetAllPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-permissions.messages.mjs';
import { BusGetAllPermissionsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-permissions.messages.mjs';
import { createOperatorGetAllPermissionsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-permissions.messages.mjs';
import { OperatorCreateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-role-with-permissions.messages.mjs';
import { createBusCreateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-role-with-permissions.messages.mjs';
import { BusCreateRoleWithPermissionsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-role-with-permissions.messages.mjs';
import { createOperatorCreateRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-role-with-permissions.messages.mjs';
import { OperatorUpdateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-role-with-permissions.messages.mjs';
import { createBusUpdateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-role-with-permissions.messages.mjs';
import { BusUpdateRoleWithPermissionsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-update-role-with-permissions.messages.mjs';
import { createOperatorUpdateRoleWithPermissionsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-role-with-permissions.messages.mjs';
import { OperatorGetAllUsersRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-users.messages.mjs';
import { createBusGetAllUsersRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-users.messages.mjs';
import { createOperatorGetAllUsersReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-users.messages.mjs';
import { BusGetAllUsersReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-users.messages.mjs';
import { OperatorGetUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-user-with-roles.messages.mjs';
import { createOperatorGetUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-user-with-roles.messages.mjs';
import { createBusGetUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-user-with-roles.messages.mjs';
import { BusGetUserWithRolesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-user-with-roles.messages.mjs';
import { OperatorCreateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-user-with-roles.messages.mjs';
import { createBusCreateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-user-with-roles.messages.mjs';
import { BusCreateUserWithRolesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-user-with-roles.messages.mjs';
import { createOperatorCreateUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-user-with-roles.messages.mjs';
import { createOperatorNotAuthorizedReplyMessage } from '@computerclubsystem/types/messages/operators/operator-not-authorized-reply.message.mjs';
import { OperatorUpdateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-user-with-roles.messages.mjs';
import { BusUpdateUserWithRolesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-update-user-with-roles.messages.mjs';
import { createOperatorUpdateUserWithRolesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-user-with-roles.messages.mjs';
import { createBusUpdateUserWithRolesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-user-with-roles.messages.mjs';
import { OperatorStopDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-stop-device.messages.mjs';
import { createBusStopDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-stop-device.messages.mjs';
import { BusStopDeviceReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-stop-device.messages.mjs';
import { createOperatorStopDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-stop-device.messages.mjs';
import { OperatorTransferDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-transfer-device.messages.mjs';
import { createBusTransferDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-transfer-device.messages.mjs';
import { BusTransferDeviceReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-transfer-device.messages.mjs';
import { createOperatorTransferDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-transfer-device.messages.mjs';
import { BusDeviceConnectivitiesNotificationMessage, BusDeviceConnectivityItem } from '@computerclubsystem/types/messages/bus/bus-device-connectivities-notification.message.mjs';
import { createOperatorDeviceConnectivitiesNotificationMessage, OperatorDeviceConnectivityItem } from '@computerclubsystem/types/messages/operators/operator-device-connectivities-notification.message.mjs';
import { OperatorCreateDeviceContinuationRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-device-continuation.messages.mjs';
import { createBusCreateDeviceContinuationRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-continuation.messages.mjs';
import { DeviceContinuation } from '@computerclubsystem/types/entities/device-continuation.mjs';
import { BusCreateDeviceContinuationReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-device-continuation.messages.mjs';
import { createOperatorCreateDeviceContinuationReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-device-continuation.messages.mjs';
import { OperatorDeleteDeviceContinuationRequestMessage } from '@computerclubsystem/types/messages/operators/operator-delete-device-continuation.messages.mjs';
import { createBusDeleteDeviceContinuationRequestMessage } from '@computerclubsystem/types/messages/bus/bus-delete-device-continuation.messages.mjs';
import { BusDeleteDeviceContinuationReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-delete-device-continuation.messages.mjs';
import { createOperatorDeleteDeviceContinuationReplyMessage } from '@computerclubsystem/types/messages/operators/operator-delete-device-continuation.messages.mjs';
import { OperatorRechargeTariffDurationRequestMessage } from '@computerclubsystem/types/messages/operators/operator-recharge-tariff-duration.messages.mjs';
import { createBusRechargeTariffDurationRequestMessage } from '@computerclubsystem/types/messages/bus/bus-recharge-tariff-duration.messages.mjs';
import { BusRechargeTariffDurationReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-recharge-tariff-duration.messages.mjs';
import { createOperatorRechargeTariffDurationReplyMessage } from '@computerclubsystem/types/messages/operators/operator-recharge-tariff-duration.messages.mjs';
import { createOperatorGetSignedInUsersReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-signed-in-users.messages.mjs';
import { SignedInUser } from '@computerclubsystem/types/entities/signed-in-user.mjs';
import { OperatorGetSignedInUsersRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-signed-in-users.messages.mjs';
import { createOperatorForceSignOutAllUserSessionsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-force-sign-out-all-user-sessions.messages.mjs';
import { OperatorForceSignOutAllUserSessionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-force-sign-out-all-user-sessions.messages.mjs';
import { createOperatorSignedOutNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-signed-out-notification.message.mjs';
import { OperatorGetCurrentShiftStatusRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-current-shift-status.messages.mjs';
import { BusGetCurrentShiftStatusReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-current-shift-status.messages.mjs';
import { createBusGetCurrentShiftStatusRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-current-shift-status.messages.mjs';
import { createOperatorGetCurrentShiftStatusReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-current-shift-status.messages.mjs';
import { OperatorCompleteShiftRequestMessage } from '@computerclubsystem/types/messages/operators/operator-complete-shift.messages.mjs';
import { createBusCompleteShiftRequestMessage } from '@computerclubsystem/types/messages/bus/bus-complete-shift.messages.mjs';
import { BusCompleteShiftReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-complete-shift.messages.mjs';
import { createOperatorCompleteShiftReplyMessage } from '@computerclubsystem/types/messages/operators/operator-complete-shift.messages.mjs';
import { OperatorGetShiftsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-shifts.messages.mjs';
import { createBusGetShiftsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-shifts.messages.mjs';
import { BusGetShiftsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-shifts.messages.mjs';
import { createOperatorGetShiftsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-shifts.messages.mjs';
import { OperatorGetAllSystemSettingsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-system-settings.messages.mjs';
import { BusGetAllSystemSettingsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings.messages.mjs';
import { createOperatorGetAllSystemSettingsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-system-settings.messages.mjs';
import { OperatorUpdateSystemSettingsValuesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-system-settings-values.messages.mjs';
import { createBusUpdateSystemSettingsValuesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-system-settings-values.messages.mjs';
import { createOperatorUpdateSystemSettingsValuesReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-system-settings-values.messages.mjs';
import { BusErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-error-code.mjs';
import { createBusGetAllSystemSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings.messages.mjs';
import { SystemSetting } from '@computerclubsystem/types/entities/system-setting.mjs';
import { BusAllSystemSettingsNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-all-system-settings-notification.message.mjs';
import { OperatorCreateDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-device.messages.mjs';
import { createBusCreateDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-device.messages.mjs';
import { createOperatorCreateDeviceReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-device.messages.mjs';
import { BusCreateDeviceReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-device.messages.mjs';
import { BusUpdateSystemSettingsValuesReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-update-system-settings-values.messages.mjs';
import { OperatorCreatePrepaidTariffRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-prepaid-tariff.messages.mjs';
import { createBusCreatePrepaidTariffRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-prepaid-tariff.messages.mjs';
import { BusCreatePrepaidTariffReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-prepaid-tariff.messages.mjs';
import { createOperatorCreatePrepaidTariffReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-prepaid-tariff.messages.mjs';
import { OperatorChangePasswordRequestMessage } from '@computerclubsystem/types/messages/operators/operator-change-password.messages.mjs';
import { createBusChangePasswordRequestMessage } from '@computerclubsystem/types/messages/bus/bus-change-password.messages.mjs';
import { BusChangePasswordReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-change-password.messages.mjs';
import { createOperatorChangePasswordReplyMessage } from '@computerclubsystem/types/messages/operators/operator-change-password.messages.mjs';
import { OperatorGetProfileSettingsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-profile-settings.messages.mjs';
import { createBusGetProfileSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-profile-settings.messages.mjs';
import { BusGetProfileSettingsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-profile-settings.messages.mjs';
import { createOperatorGetProfileSettingsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-profile-settings.messages.mjs';
import { OperatorUpdateProfileSettingsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-profile-settings.messages.mjs';
import { createBusUpdateProfileSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-profile-settings.messages.mjs';
import { BusUpdateProfileSettingsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-update-profile-settings.messages.mjs';
import { createOperatorUpdateProfileSettingsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-profile-settings.messages.mjs';
import { OperatorGetAllDeviceGroupsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-device-groups.messages.mjs';
import { createBusGetAllDeviceGroupsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-device-groups.messages.mjs';
import { BusGetAllDeviceGroupsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-device-groups.messages.mjs';
import { createOperatorGetAllDeviceGroupsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-device-groups.messages.mjs';
import { OperatorGetDeviceGroupDataRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-group-data.messages.mjs';
import { createBusGetDeviceGroupDataRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-group-data.messages.mjs';
import { BusGetDeviceGroupDataReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-device-group-data.messages.mjs';
import { createOperatorGetDeviceGroupDataReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-group-data.messages.mjs';
import { OperatorCreateDeviceGroupRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-device-group.messages.mjs';
import { createBusCreateDeviceGroupRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-group.messages.mjs';
import { BusCreateDeviceGroupReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-create-device-group.messages.mjs';
import { createOperatorCreateDeviceGroupReplyMessage } from '@computerclubsystem/types/messages/operators/operator-create-device-group.messages.mjs';
import { OperatorUpdateDeviceGroupRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-device-group.messages.mjs';
import { BusUpdateDeviceGroupReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-update-device-group.messages.mjs';
import { createOperatorUpdateDeviceGroupReplyMessage } from '@computerclubsystem/types/messages/operators/operator-update-device-group.messages.mjs';
import { createBusUpdateDeviceGroupRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-group.messages.mjs';
import { OperatorGetAllAllowedDeviceObjectsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-allowed-device-objects.messages.mjs';
import { createBusGetAllAllowedDeviceObjectsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-allowed-device-objects.messages.mjs';
import { BusGetAllAllowedDeviceObjectsReplyMessageBody } from '@computerclubsystem/types/messages/bus/bus-get-all-allowed-device-objects.messages.mjs';
import { createOperatorGetAllAllowedDeviceObjectsReplyMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-allowed-device-objects.messages.mjs';
import { createOperatorSetDeviceStatusNoteReplyMessage, OperatorSetDeviceStatusNoteRequestMessage } from '@computerclubsystem/types/messages/operators/operator-set-device-status-note.messages.mjs';
import { BusSetDeviceStatusNoteReplyMessageBody, createBusSetDeviceStatusNoteRequestMessage } from '@computerclubsystem/types/messages/bus/bus-set-device-status-note.messages.mjs';
import { BusGetLastCompletedShiftReplyMessageBody, createBusGetLastCompletedShiftRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-last-completed-shift.messages.mjs';
import { createOperatorSignInInformationNotificationMessage } from '@computerclubsystem/types/messages/operators/operator-sign-in-information-notification.message.mjs';
import { createOperatorGetDeviceCompletedSessionsReplyMessage, OperatorGetDeviceCompletedSessionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-completed-sessions.messages.mjs';
import { BusGetDeviceCompletedSessionsReplyMessageBody, createBusGetDeviceCompletedSessionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-completed-sessions.messages.mjs';
import { createOperatorFilterServerLogsReplyMessage, OperatorFilterServerLogsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-filter-server-logs.messages.mjs';
import { createBusFilterServerLogsNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-filter-server-logs-notification.message.mjs';
import { createOperatorShutdownStoppedReplyMessage, OperatorShutdownStoppedRequestMessage } from '@computerclubsystem/types/messages/operators/operator-shutdown-stopped.messages.mjs';
import { BusShutdownStoppedReplyMessageBody, createBusShutdownStoppedRequestMessage } from '@computerclubsystem/types/messages/bus/bus-shutdown-stopped.messages.mjs';
import { createOperatorGetTariffDeviceGroupsReplyMessage, OperatorGetTariffDeviceGroupsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-tariff-device-groups.messages.mjs';
import { BusGetTariffDeviceGroupsReplyMessageBody, createBusGetTariffDeviceGroupsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-tariff-device-groups.messages.mjs';
import { createOperatorRestartDevicesReplyMessage, OperatorRestartDevicesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-restart-devices.messages.mjs';
import { BusRestartDevicesReplyMessageBody, createBusRestartDevicesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-restart-devices.messages.mjs';
import { createOperatorGetDeviceConnectivityDetailsReplyMessage, OperatorGetDeviceConnectivityDetailsReplyMessageBody, OperatorGetDeviceConnectivityDetailsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-connectivity-details.messages.mjs';
import { BusGetDeviceConnectivityDetailsReplyMessageBody, createBusGetDeviceConnectivityDetailsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-connectivity-details.messages.mjs';

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

    private wssServer!: WssServer;
    private wssEmitter!: EventEmitter;
    private connectedClients = new Map<number, ConnectedClientData>();

    async processOperatorMessage(connectionId: number, message: OperatorRequestMessage<unknown>): Promise<void> {
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
        switch (type) {
            case OperatorRequestMessageType.getDeviceConnectivityDetailsRequest:
                this.processGetDeviceConnectivityDetailsRequestMessage(clientData, message as OperatorGetDeviceConnectivityDetailsRequestMessage);
                break;
            case OperatorRequestMessageType.getTariffDeviceGroupsRequest:
                this.processOperatorGetTariffDeviceGroupsRequestMessage(clientData, message as OperatorGetTariffDeviceGroupsRequestMessage);
                break;
            case OperatorRequestMessageType.restartDevicesRequest:
                this.processOperatorRestartDevicesRequestMessage(clientData, message as OperatorRestartDevicesRequestMessage);
                break;
            case OperatorRequestMessageType.shutdownStoppedRequest:
                this.processOperatorShutdownStoppedRequestMessage(clientData, message as OperatorShutdownStoppedRequestMessage);
                break;
            case OperatorRequestMessageType.filterServerLogsRequest:
                this.processOperatorFilterServerLogsRequestMessage(clientData, message as OperatorFilterServerLogsRequestMessage);
                break;
            case OperatorRequestMessageType.getDeviceCompletedSessionsRequest:
                this.processOperatorGetDeviceCompletedSessionsRequestMessage(clientData, message as OperatorGetDeviceCompletedSessionsRequestMessage);
                break;
            case OperatorRequestMessageType.setDeviceStatusNoteRequest:
                this.processOperatorSetDeviceStatusNoteRequestMessage(clientData, message as OperatorSetDeviceStatusNoteRequestMessage);
                break;
            case OperatorRequestMessageType.getAllAllowedDeviceObjectsRequest:
                this.processOperatorGetAllAllowedDeviceObjectsRequestMessage(clientData, message as OperatorGetAllAllowedDeviceObjectsRequestMessage);
                break;
            case OperatorRequestMessageType.updateDeviceGroupRequest:
                this.processOperatorUpdateDeviceGroupRequestMessage(clientData, message as OperatorUpdateDeviceGroupRequestMessage);
                break;
            case OperatorRequestMessageType.createDeviceGroupRequest:
                this.processOperatorCreateDeviceGroupRequestMessage(clientData, message as OperatorCreateDeviceGroupRequestMessage);
                break;
            case OperatorRequestMessageType.getDeviceGroupDataRequest:
                this.processOperatorGetDeviceGroupDataRequestMessage(clientData, message as OperatorGetDeviceGroupDataRequestMessage);
                break;
            case OperatorRequestMessageType.getAllDeviceGroupsRequest:
                this.processOperatorGetAllDeviceGroupsRequestMessage(clientData, message as OperatorGetAllDeviceGroupsRequestMessage);
                break;
            case OperatorRequestMessageType.updateProfileSettingsRequest:
                this.processOperatorUpdateProfileSettingsRequestMessage(clientData, message as OperatorUpdateProfileSettingsRequestMessage);
                break;
            case OperatorRequestMessageType.getProfileSettingsRequest:
                this.processOperatorGetProfileSettingsRequestMessage(clientData, message as OperatorGetProfileSettingsRequestMessage);
                break;
            case OperatorRequestMessageType.changePasswordRequest:
                this.processChangePasswordRequestMessage(clientData, message as OperatorChangePasswordRequestMessage);
                break;
            case OperatorRequestMessageType.createDeviceRequest:
                this.processOperatorCreateDeviceRequestMessage(clientData, message as OperatorCreateDeviceRequestMessage);
                break;
            case OperatorRequestMessageType.updateSystemSettingsValuesRequest:
                this.processOperatorUpdateSystemSettingsValuesRequestMessage(clientData, message as OperatorUpdateSystemSettingsValuesRequestMessage);
                break;
            case OperatorRequestMessageType.getAllSystemSettingsRequest:
                this.processOperatorGetAllSystemSettingsRequestMessage(clientData, message as OperatorGetAllSystemSettingsRequestMessage);
                break;
            case OperatorRequestMessageType.getShifts:
                this.processOperatorGetShiftsRequestMessage(clientData, message as OperatorGetShiftsRequestMessage);
                break;
            case OperatorRequestMessageType.completeShiftRequest:
                this.processOperatorCompleteShiftRequestMessage(clientData, message as OperatorCompleteShiftRequestMessage);
                break;
            case OperatorRequestMessageType.getCurrentShiftStatusRequest:
                this.processOperatorGetCurrentShiftStatusRequestMessage(clientData, message as OperatorGetCurrentShiftStatusRequestMessage);
                break;
            case OperatorRequestMessageType.forceSignOutAllUserSessionsRequest:
                this.processOperatorForceSignOutAllUserSessionsRequestMessage(clientData, message as OperatorForceSignOutAllUserSessionsRequestMessage);
                break;
            case OperatorRequestMessageType.getSigndInUsersRequest:
                this.processGetSignedInUsersRequestMessage(clientData, message as OperatorGetSignedInUsersRequestMessage);
                break;
            case OperatorRequestMessageType.rechargeTariffDurationRequest:
                this.processRechargeTariffDurationRequestMessage(clientData, message as OperatorRechargeTariffDurationRequestMessage);
                break;
            case OperatorRequestMessageType.deleteDeviceContinuationRequest:
                this.processDeleteDeviceContinuationRequestMessage(clientData, message as OperatorDeleteDeviceContinuationRequestMessage);
                break;
            case OperatorRequestMessageType.createDeviceContinuationRequest:
                this.processCreateDeviceContinuationRequestMessage(clientData, message as OperatorCreateDeviceContinuationRequestMessage);
                break;
            case OperatorRequestMessageType.transferDeviceRequest:
                this.processTransferDeviceRequestMessage(clientData, message as OperatorTransferDeviceRequestMessage);
                break;
            case OperatorRequestMessageType.stopDeviceRequest:
                this.processStopDeviceRequestMessage(clientData, message as OperatorStopDeviceRequestMessage);
                break;
            case OperatorRequestMessageType.updateUserWithRolesRequest:
                this.processUpdateUserWithRolesRequestMessage(clientData, message as OperatorUpdateUserWithRolesRequestMessage);
                break;
            case OperatorRequestMessageType.createUserWithRolesRequest:
                this.processCreateUserWithRolesRequestMessage(clientData, message as OperatorCreateUserWithRolesRequestMessage);
                break;
            case OperatorRequestMessageType.getUserWithRolesRequest:
                this.processGetUserWithRolesRequestMessage(clientData, message as OperatorGetUserWithRolesRequestMessage);
                break;
            case OperatorRequestMessageType.getAllUsersRequest:
                this.processOperatorGetAllUsersRequestMessage(clientData, message as OperatorGetAllUsersRequestMessage);
                break;
            case OperatorRequestMessageType.createRoleWithPermissionsRequest:
                this.processOperatorCreateRoleWithPermissionsRequestMessage(clientData, message as OperatorCreateRoleWithPermissionsRequestMessage);
                break;
            case OperatorRequestMessageType.updateRoleWithPermissionsRequest:
                this.processOperatorUpdateRoleWithPermissionsRequestMessage(clientData, message as OperatorUpdateRoleWithPermissionsRequestMessage);
                break;
            case OperatorRequestMessageType.getAllPermissionsRequest:
                this.processOperatorGetAllPermissionsRequestMessage(clientData, message as OperatorGetAllPermissionsRequestMessage);
                break;
            case OperatorRequestMessageType.getRoleWithPermissionsRequest:
                this.processOperatorGetRoleWithPermissionsRequestMessage(clientData, message as OperatorGetRoleWithPermissionsRequestMessage);
                break;
            case OperatorRequestMessageType.getAllRolesRequest:
                this.processOperatorGetAllRolesRequestMessage(clientData, message as OperatorGetAllRolesRequestMessage);
                break;
            case OperatorRequestMessageType.getDeviceStatusesRequest:
                this.processOperatorGetDeviceStatusesRequestMessage(clientData, message as OperatorGetDeviceStatusesRequestMessage);
                break;
            case OperatorRequestMessageType.startDeviceRequest:
                this.processOperatorStartDeviceRequestMessage(clientData, message as OperatorStartDeviceRequestMessage);
                break;
            case OperatorRequestMessageType.getTariffByIdRequest:
                this.processOperatorGetTariffByIdRequestMessage(clientData, message as OperatorGetTariffByIdRequestMessage);
                break;
            case OperatorRequestMessageType.createPrepaidTariffRequest:
                this.processOperatorCreatePrepaidTariffRequestMessage(clientData, message as OperatorCreatePrepaidTariffRequestMessage);
                break;
            case OperatorRequestMessageType.createTariffRequest:
                this.processOperatorCreateTariffRequestMessage(clientData, message as OperatorCreateTariffRequestMessage);
                break;
            case OperatorRequestMessageType.updateTariffRequest:
                this.processOperatorUpdateTariffRequestMessage(clientData, message as OperatorUpdateTariffRequestMessage);
                break;
            case OperatorRequestMessageType.getAllTariffsRequest:
                this.processOperatorGetAllTariffsRequestMessage(clientData, message as OperatorGetAllTariffsRequestMessage);
                break;
            case OperatorRequestMessageType.updateDeviceRequest:
                this.processOperatorUpdateDeviceRequestMessage(clientData, message as OperatorUpdateDeviceRequestMessage);
                break;
            case OperatorRequestMessageType.getAllDevicesRequest:
                this.processOperatorGetAllDevicesRequestMessage(clientData, message as OperatorGetAllDevicesRequestMessage);
                break;
            case OperatorRequestMessageType.getDeviceByIdRequest:
                this.processOperatorGetDeviceByIdRequestMessage(clientData, message as OperatorGetDeviceByIdRequestMessage);
                break;
            case OperatorRequestMessageType.authRequest:
                this.processOperatorAuthRequestMessage(clientData, message as OperatorAuthRequestMessage);
                break;
            case OperatorRequestMessageType.refreshTokenRequest:
                this.processOperatorRefreshTokenRequestMessage(clientData, message as OperatorRefreshTokenRequestMessage);
                break;
            case OperatorRequestMessageType.signOutRequest:
                this.processOperatorSignOutRequestMessage(clientData, message as OperatorSignOutRequestMessage);
                break;
            case OperatorRequestMessageType.pingRequest:
                clientData.receivedPingMessagesCount++;
                // this.processOperatorPingRequestMessage(clientData, message as OperatorPingRequestMessage);
                break;
        }
    }

    processGetDeviceConnectivityDetailsRequestMessage(clientData: ConnectedClientData, message: OperatorGetDeviceConnectivityDetailsRequestMessage): void {
        const busReqMsg = createBusGetDeviceConnectivityDetailsRequestMessage();
        busReqMsg.body.deviceId = message.body.deviceId;
        this.publishToDevicesChannelAndWaitForReply<BusGetDeviceConnectivityDetailsReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetDeviceConnectivityDetailsReplyMessage();
                const busBody = busReplyMsg.body;
                const replyMsgBody: OperatorGetDeviceConnectivityDetailsReplyMessageBody = {
                    connectionEventItems: busBody.connectionEventItems,
                    connectionsCount: busBody.connectionsCount,
                    deviceId: busBody.deviceId,
                    isConnected: busBody.isConnected,
                    receivedMessagesCount: busBody.receivedMessagesCount,
                    secondsSinceLastConnection: busBody.secondsSinceLastConnection,
                    sentMessagesCount: busBody.sentMessagesCount,
                    secondsSinceLastReceivedMessage: busBody.secondsSinceLastReceivedMessage,
                    secondsSinceLastSentMessage: busBody.secondsSinceLastSentMessage,
                };
                operatorReplyMsg.body = replyMsgBody;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetTariffDeviceGroupsRequestMessage(clientData: ConnectedClientData, message: OperatorGetTariffDeviceGroupsRequestMessage): void {
        const busReqMsg = createBusGetTariffDeviceGroupsRequestMessage();
        busReqMsg.body.tariffId = message.body.tariffId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetTariffDeviceGroupsReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetTariffDeviceGroupsReplyMessage();
                operatorReplyMsg.body.deviceGroupIds = busReplyMsg.body.deviceGroupIds;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorRestartDevicesRequestMessage(clientData: ConnectedClientData, message: OperatorRestartDevicesRequestMessage): void {
        const busReqMsg = createBusRestartDevicesRequestMessage();
        busReqMsg.body.deviceIds = message.body.deviceIds;
        this.publishToDevicesChannelAndWaitForReply<BusRestartDevicesReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorRestartDevicesReplyMessage();
                operatorReplyMsg.body.targetsCount = busReplyMsg.body.targetsCount;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorShutdownStoppedRequestMessage(clientData: ConnectedClientData, message: OperatorShutdownStoppedRequestMessage): void {
        const busReqMsg = createBusShutdownStoppedRequestMessage();
        this.publishToDevicesChannelAndWaitForReply<BusShutdownStoppedReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorShutdownStoppedReplyMessage();
                operatorReplyMsg.body.targetsCount = busReplyMsg.body.targetsCount;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorFilterServerLogsRequestMessage(clientData: ConnectedClientData, message: OperatorFilterServerLogsRequestMessage): void {
        const busReqMsg = createBusFilterServerLogsNotificationMessage();
        busReqMsg.body.filterServerLogsItems = message.body.filterServerLogsItems;
        this.publishToSharedChannel(busReqMsg);
        const operatorConnectorFilterLogsItem = message.body.filterServerLogsItems.find(x => x.serviceName === this.messageBusIdentifier);
        if (operatorConnectorFilterLogsItem) {
            this.state.filterLogsItem = operatorConnectorFilterLogsItem;
            this.state.filterLogsRequestedAt = this.getNowAsNumber();
            this.logger.setMessageFilter(operatorConnectorFilterLogsItem.messageFilter);
        }
        const operatorReplyMsg = createOperatorFilterServerLogsReplyMessage();
        this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
    }

    processOperatorGetDeviceCompletedSessionsRequestMessage(clientData: ConnectedClientData, message: OperatorGetDeviceCompletedSessionsRequestMessage): void {
        const busReqMsg = createBusGetDeviceCompletedSessionsRequestMessage();
        busReqMsg.body.deviceId = message.body.deviceId;
        busReqMsg.body.fromDate = message.body.fromDate;
        busReqMsg.body.toDate = message.body.toDate;
        busReqMsg.body.userId = message.body.userId;
        busReqMsg.body.tariffId = message.body.tariffId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetDeviceCompletedSessionsReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetDeviceCompletedSessionsReplyMessage();
                operatorReplyMsg.body.deviceSessions = busReplyMsg.body.deviceSessions;
                operatorReplyMsg.body.totalSum = busReplyMsg.body.totalSum;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorSetDeviceStatusNoteRequestMessage(clientData: ConnectedClientData, message: OperatorSetDeviceStatusNoteRequestMessage): void {
        const busReqMsg = createBusSetDeviceStatusNoteRequestMessage();
        busReqMsg.body.deviceIds = message.body.deviceIds;
        busReqMsg.body.note = message.body.note;
        this.publishToOperatorsChannelAndWaitForReply<BusSetDeviceStatusNoteReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorSetDeviceStatusNoteReplyMessage();
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllAllowedDeviceObjectsRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllAllowedDeviceObjectsRequestMessage): void {
        const busReqMsg = createBusGetAllAllowedDeviceObjectsRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllAllowedDeviceObjectsReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllAllowedDeviceObjectsReplyMessage();
                operatorReplyMsg.body.allowedDeviceObjects = busReplyMsg.body.allowedDeviceObjects;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorUpdateDeviceGroupRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateDeviceGroupRequestMessage): void {
        const busReqMsg = createBusUpdateDeviceGroupRequestMessage();
        busReqMsg.body.deviceGroup = message.body.deviceGroup;
        busReqMsg.body.assignedTariffIds = message.body.assignedTariffIds;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateDeviceGroupReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateDeviceGroupReplyMessage();
                operatorReplyMsg.body.deviceGroup = busReplyMsg.body.deviceGroup;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorCreateDeviceGroupRequestMessage(clientData: ConnectedClientData, message: OperatorCreateDeviceGroupRequestMessage): void {
        const busReqMsg = createBusCreateDeviceGroupRequestMessage();
        busReqMsg.body.deviceGroup = message.body.deviceGroup;
        busReqMsg.body.assignedTariffIds = message.body.assignedTariffIds;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateDeviceGroupReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateDeviceGroupReplyMessage();
                operatorReplyMsg.body.deviceGroup = busReplyMsg.body.deviceGroup;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetDeviceGroupDataRequestMessage(clientData: ConnectedClientData, message: OperatorGetDeviceGroupDataRequestMessage): void {
        const busReqMsg = createBusGetDeviceGroupDataRequestMessage();
        busReqMsg.body.deviceGroupId = message.body.deviceGroupId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetDeviceGroupDataReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetDeviceGroupDataReplyMessage();
                operatorReplyMsg.body.deviceGroupData = busReplyMsg.body.deviceGroupData;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllDeviceGroupsRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllDeviceGroupsRequestMessage): void {
        const busReqMsg = createBusGetAllDeviceGroupsRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllDeviceGroupsReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllDeviceGroupsReplyMessage();
                operatorReplyMsg.body.deviceGroups = busReplyMsg.body.deviceGroups;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }


    processOperatorUpdateProfileSettingsRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateProfileSettingsRequestMessage): void {
        const busReqMsg = createBusUpdateProfileSettingsRequestMessage();
        busReqMsg.body.profileSettings = message.body.profileSettings;
        busReqMsg.body.userId = clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateProfileSettingsReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateProfileSettingsReplyMessage();
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetProfileSettingsRequestMessage(clientData: ConnectedClientData, message: OperatorGetProfileSettingsRequestMessage): void {
        const busReqMsg = createBusGetProfileSettingsRequestMessage();
        busReqMsg.body.userId = clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusGetProfileSettingsReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetProfileSettingsReplyMessage();
                operatorReplyMsg.body.settings = busReplyMsg.body.settings;
                operatorReplyMsg.body.username = busReplyMsg.body.username;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processChangePasswordRequestMessage(clientData: ConnectedClientData, message: OperatorChangePasswordRequestMessage): void {
        const busReqMsg = createBusChangePasswordRequestMessage();
        busReqMsg.body.userId = clientData.userId!;
        busReqMsg.body.currentPasswordHash = message.body.currentPasswordHash;
        busReqMsg.body.newPasswordHash = message.body.newPasswordHash;
        this.publishToOperatorsChannelAndWaitForReply<BusChangePasswordReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorChangePasswordReplyMessage();
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorCreateDeviceRequestMessage(clientData: ConnectedClientData, message: OperatorCreateDeviceRequestMessage): void {
        const busReqMsg = createBusCreateDeviceRequestMessage();
        busReqMsg.body.device = message.body.device;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateDeviceReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateDeviceReplyMessage();
                operatorReplyMsg.body.device = busReplyMsg.body.device;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorUpdateSystemSettingsValuesRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateSystemSettingsValuesRequestMessage): void {
        const busReqMsg = createBusUpdateSystemSettingsValuesRequestMessage();
        busReqMsg.body.systemSettingsNameWithValues = message.body.systemSettingsNameWithValues;
        this.publishToSharedChannelAndWaitForReply<BusUpdateSystemSettingsValuesReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateSystemSettingsValuesReplyMessage();
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                // If the error is not BusErrorCode.serverError - get errors from bus reply - they are considered safe
                if (busReplyMsg.header.errors?.[0]?.code !== BusErrorCode.serverError) {
                    operatorReplyMsg.header.errors = busReplyMsg.header.errors;
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllSystemSettingsRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllSystemSettingsRequestMessage): void {
        const busReqMsg = createBusGetAllSystemSettingsRequestMessage();
        this.publishToSharedChannelAndWaitForReply<BusGetAllSystemSettingsReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllSystemSettingsReplyMessage();
                operatorReplyMsg.body.systemSettings = busReplyMsg.body.systemSettings;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetShiftsRequestMessage(clientData: ConnectedClientData, message: OperatorGetShiftsRequestMessage): void {
        const busReqMsg = createBusGetShiftsRequestMessage();
        busReqMsg.body.fromDate = message.body.fromDate;
        busReqMsg.body.toDate = message.body.toDate;
        busReqMsg.body.userId = message.body.userId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetShiftsReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetShiftsReplyMessage();
                operatorReplyMsg.body.shifts = busReplyMsg.body.shifts;
                operatorReplyMsg.body.shiftsSummary = busReplyMsg.body.shiftsSummary;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorCompleteShiftRequestMessage(clientData: ConnectedClientData, message: OperatorCompleteShiftRequestMessage): void {
        const busReqMsg = createBusCompleteShiftRequestMessage();
        busReqMsg.body.shiftStatus = message.body.shiftStatus;
        busReqMsg.body.note = message.body.note;
        busReqMsg.body.userId = clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusCompleteShiftReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCompleteShiftReplyMessage();
                operatorReplyMsg.body.shift = busReplyMsg.body.shift;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
                // TODO: Only send completed shift information
                this.sendSignInInformationNotificationMessage(clientData);
            });
    }

    processOperatorGetCurrentShiftStatusRequestMessage(clientData: ConnectedClientData, message: OperatorGetCurrentShiftStatusRequestMessage): void {
        const busReqMsg = createBusGetCurrentShiftStatusRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetCurrentShiftStatusReplyMessageBody>(busReqMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetCurrentShiftStatusReplyMessage();
                operatorReplyMsg.body.shiftStatus = busReplyMsg.body.shiftStatus;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
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
        }
        replyMsg.body.sessionsCount = allUserAuthData.length;
        this.sendReplyMessageToOperator(replyMsg, clientData, message);
    }


    async processGetSignedInUsersRequestMessage(clientData: ConnectedClientData, message: OperatorGetSignedInUsersRequestMessage): Promise<void> {
        const replyMsg = createOperatorGetSignedInUsersReplyMessage();
        const allUsersAuthData = await this.cacheHelper.getAllUsersAuthData();
        const signedInUsers: SignedInUser[] = [];
        for (const authDataItem of allUsersAuthData) {
            signedInUsers.push({
                connectionId: authDataItem.roundtripData.connectionId,
                connectionInstanceId: authDataItem.roundtripData.connectionInstanceId,
                connectedAt: authDataItem.connectedAt,
                tokenExpiresAt: authDataItem.tokenExpiresAt,
                token: authDataItem.token,
                userId: authDataItem.userId,
                username: authDataItem.username,
            });
        }
        replyMsg.body.signedInUsers = signedInUsers;
        this.sendReplyMessageToOperator(replyMsg, clientData, message);
    }

    processRechargeTariffDurationRequestMessage(clientData: ConnectedClientData, message: OperatorRechargeTariffDurationRequestMessage): void {
        const busRequestMsg = createBusRechargeTariffDurationRequestMessage();
        busRequestMsg.body.tariffId = message.body.tariffId;
        busRequestMsg.body.userId = clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusRechargeTariffDurationReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorRechargeTariffDurationReplyMessage();
                const tariff: Tariff = busReplyMsg.body.tariff;
                operatorReplyMsg.body.remainingSeconds = tariff?.remainingSeconds;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processDeleteDeviceContinuationRequestMessage(clientData: ConnectedClientData, message: OperatorDeleteDeviceContinuationRequestMessage): void {
        const busRequestMsg = createBusDeleteDeviceContinuationRequestMessage();
        busRequestMsg.body.deviceId = message.body.deviceId;
        this.publishToOperatorsChannelAndWaitForReply<BusDeleteDeviceContinuationReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorDeleteDeviceContinuationReplyMessage();
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processCreateDeviceContinuationRequestMessage(clientData: ConnectedClientData, message: OperatorCreateDeviceContinuationRequestMessage): void {
        const busRequestMsg = createBusCreateDeviceContinuationRequestMessage();
        const deviceContinuation: DeviceContinuation = message.body.deviceContinuation;
        deviceContinuation.userId = clientData.userId!;
        busRequestMsg.body.deviceContinuation = deviceContinuation;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateDeviceContinuationReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateDeviceContinuationReplyMessage();
                operatorReplyMsg.body.deviceContinuation = operatorReplyMsg.body.deviceContinuation;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processTransferDeviceRequestMessage(clientData: ConnectedClientData, message: OperatorTransferDeviceRequestMessage): void {
        const busRequestMsg = createBusTransferDeviceRequestMessage();
        busRequestMsg.body.sourceDeviceId = message.body.sourceDeviceId;
        busRequestMsg.body.targetDeviceId = message.body.targetDeviceId;
        busRequestMsg.body.userId = clientData.userId!;
        busRequestMsg.body.transferNote = message.body.transferNote;
        this.publishToOperatorsChannelAndWaitForReply<BusTransferDeviceReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorTransferDeviceReplyMessage();
                operatorReplyMsg.body.sourceDeviceStatus = busReplyMsg.body.sourceDeviceStatus;
                operatorReplyMsg.body.targetDeviceStatus = busReplyMsg.body.targetDeviceStatus;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processStopDeviceRequestMessage(clientData: ConnectedClientData, message: OperatorStopDeviceRequestMessage): void {
        const requestMsg = createBusStopDeviceRequestMessage();
        requestMsg.body.deviceId = message.body.deviceId;
        requestMsg.body.userId = clientData.userId!;
        requestMsg.body.note = message.body.note;
        // TODO: stoppedByCustomer is used by pc-connector to specify if the computer was requested to be stopped by customer
        // requestMsg.body.stoppedByCustomer
        this.publishToOperatorsChannelAndWaitForReply<BusStopDeviceReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorStopDeviceReplyMessage();
                operatorReplyMsg.body.deviceStatus = busReplyMsg.body.deviceStatus;
                this.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processUpdateUserWithRolesRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateUserWithRolesRequestMessage): void {
        const requestMsg = createBusUpdateUserWithRolesRequestMessage();
        requestMsg.body.user = message.body.user;
        requestMsg.body.roleIds = message.body.roleIds;
        requestMsg.body.passwordHash = message.body.passwordHash;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateUserWithRolesReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateUserWithRolesReplyMessage();
                operatorReplyMsg.body.user = busReplyMsg.body.user;
                operatorReplyMsg.body.roleIds = busReplyMsg.body.roleIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.updateUserWithRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processCreateUserWithRolesRequestMessage(clientData: ConnectedClientData, message: OperatorCreateUserWithRolesRequestMessage): void {
        const requestMsg = createBusCreateUserWithRolesRequestMessage();
        requestMsg.body.user = message.body.user;
        requestMsg.body.roleIds = message.body.roleIds;
        requestMsg.body.passwordHash = message.body.passwordHash;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateUserWithRolesReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateUserWithRolesReplyMessage();
                operatorReplyMsg.body.user = busReplyMsg.body.user;
                operatorReplyMsg.body.roleIds = busReplyMsg.body.roleIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.createUserWithRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processGetUserWithRolesRequestMessage(clientData: ConnectedClientData, message: OperatorGetUserWithRolesRequestMessage): void {
        const requestMsg = createBusGetUserWithRolesRequestMessage();
        requestMsg.body.userId = message.body.userId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetUserWithRolesReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetUserWithRolesReplyMessage();
                operatorReplyMsg.body.user = busReplyMsg.body.user;
                operatorReplyMsg.body.roleIds = busReplyMsg.body.roleIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.getUserWithRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllUsersRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllUsersRequestMessage): void {
        const requestMsg = createBusGetAllUsersRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllUsersReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllUsersReplyMessage();
                operatorReplyMsg.body.users = busReplyMsg.body.users;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantGetAllUsersErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorUpdateRoleWithPermissionsRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateRoleWithPermissionsRequestMessage): void {
        const requestMsg = createBusUpdateRoleWithPermissionsRequestMessage();
        requestMsg.body.role = message.body.role;
        requestMsg.body.permissionIds = message.body.rolePermissionIds;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateRoleWithPermissionsReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateRoleWithPermissionsReplyMessage();
                operatorReplyMsg.body.role = busReplyMsg.body.role;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantUpdateRoleWithPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorCreateRoleWithPermissionsRequestMessage(clientData: ConnectedClientData, message: OperatorCreateRoleWithPermissionsRequestMessage): void {
        const requestMsg = createBusCreateRoleWithPermissionsRequestMessage();
        requestMsg.body.role = message.body.role;
        requestMsg.body.permissionIds = message.body.rolePermissionIds;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateRoleWithPermissionsReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateRoleWithPermissionsReplyMessage();
                operatorReplyMsg.body.role = busReplyMsg.body.role;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantCreateRoleWithPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllPermissionsRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllRolesRequestMessage): void {
        const requestMsg = createBusGetAllPermissionsRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllPermissionsReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllPermissionsReplyMessage();
                operatorReplyMsg.body.permissions = busReplyMsg.body.permissions;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantGetAllPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetRoleWithPermissionsRequestMessage(clientData: ConnectedClientData, message: OperatorGetRoleWithPermissionsRequestMessage): void {
        const requestMsg = createBusGetRoleWithPermissionsRequestMessage();
        requestMsg.body.roleId = message.body.roleId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetRoleWithPermissionsReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetRoleWithPermissionsReplyMessage();
                operatorReplyMsg.body.allPermissions = busReplyMsg.body.allPermissions;
                operatorReplyMsg.body.role = busReplyMsg.body.role;
                operatorReplyMsg.body.rolePermissionIds = busReplyMsg.body.rolePermissionIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantGetAllRoleWithPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetAllRolesRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllRolesRequestMessage): void {
        const requestMsg = createBusGetAllRolesRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllRolesReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllRolesReplyMessage();
                operatorReplyMsg.body.roles = busReplyMsg.body.roles;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.cantGetAllRolesErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorUpdateTariffRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateTariffRequestMessage): void {
        const validateTariffResult = this.validators.tariff.validateTariff(message.body.tariff);
        if (!validateTariffResult.success) {
            const errorReplyMsg = createOperatorUpdateTariffReplyMessage();
            errorReplyMsg.header.failure = true;
            errorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.tariffCreationError,
                description: `${validateTariffResult.errorCode}: ${validateTariffResult.errorMessage}`,
            }] as MessageError[];
            this.sendReplyMessageToOperator(errorReplyMsg, clientData, message);
            return;
        }

        const busRequestMsg = createBusUpdateTariffRequestMessage();
        busRequestMsg.body.tariff = message.body.tariff;
        busRequestMsg.body.passwordHash = message.body.passwordHash;
        busRequestMsg.body.userId = clientData.userId!;
        busRequestMsg.body.deviceGroupIds = message.body.deviceGroupIds;
        this.publishToOperatorsChannelAndWaitForReply<BusGetTariffByIdReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateTariffReplyMessage();
                operatorReplyMsg.body.tariff = busReplyMsg.body.tariff;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.getCantUpdateTariffErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorGetTariffByIdRequestMessage(clientData: ConnectedClientData, message: OperatorGetTariffByIdRequestMessage): void {
        // Validate
        const busRequestMsg = createBusGetTariffByIdRequestMessage();
        busRequestMsg.body.tariffId = message.body.tariffId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetTariffByIdReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetTariffByIdReplyMessage();
                operatorReplyMsg.body.tariff = busReplyMsg.body.tariff;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.getCantGetTariffByIdErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
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

    processOperatorStartDeviceRequestMessage(clientData: ConnectedClientData, message: OperatorStartDeviceRequestMessage): void {
        // TODO: Validate
        const busRequestMsg = createBusStartDeviceRequestMessage();
        busRequestMsg.body.deviceId = message.body.deviceId;
        busRequestMsg.body.tariffId = message.body.tariffId;
        busRequestMsg.body.userId = clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusStartDeviceReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorStartDeviceReplyMessage();
                operatorReplyMsg.body.deviceStatus = busReplyMsg.body.deviceStatus;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = this.errorReplyHelper.getCantStartTheDeviceErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorCreatePrepaidTariffRequestMessage(clientData: ConnectedClientData, message: OperatorCreatePrepaidTariffRequestMessage): void {
        const validateTariffResult = this.validators.tariff.validateTariff(message.body.tariff);
        if (!validateTariffResult.success) {
            const errorReplyMsg = createOperatorCreateTariffReplyMessage();
            errorReplyMsg.header.failure = true;
            errorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.tariffCreationError,
                description: `${validateTariffResult.errorCode}: ${validateTariffResult.errorMessage}`,
            }] as MessageError[];
            this.sendReplyMessageToOperator(errorReplyMsg, clientData, message);
            return;
        }
        const requestedTariff: Tariff = message.body.tariff;
        requestedTariff.description = requestedTariff.description?.trim();
        requestedTariff.name = requestedTariff.name.trim();

        const busRequestMsg = createBusCreatePrepaidTariffRequestMessage();
        busRequestMsg.body.tariff = requestedTariff;
        busRequestMsg.body.passwordHash = message.body.passwordHash;
        busRequestMsg.body.userId = clientData.userId!;
        busRequestMsg.body.deviceGroupIds = message.body.deviceGroupIds;
        this.publishToOperatorsChannelAndWaitForReply<BusCreatePrepaidTariffReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreatePrepaidTariffReplyMessage();
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

    processOperatorCreateTariffRequestMessage(clientData: ConnectedClientData, message: OperatorCreateTariffRequestMessage): void {
        const validateTariffResult = this.validators.tariff.validateTariff(message.body.tariff);
        if (!validateTariffResult.success) {
            const errorReplyMsg = createOperatorCreateTariffReplyMessage();
            errorReplyMsg.header.failure = true;
            errorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.tariffCreationError,
                description: `${validateTariffResult.errorCode}: ${validateTariffResult.errorMessage}`,
            }] as MessageError[];
            this.sendReplyMessageToOperator(errorReplyMsg, clientData, message);
            return;
        }
        const requestedTariff: Tariff = message.body.tariff;
        requestedTariff.description = requestedTariff.description?.trim();
        requestedTariff.name = requestedTariff.name.trim();

        const busRequestMsg = createBusCreateTariffRequestMessage();
        busRequestMsg.body.tariff = requestedTariff;
        busRequestMsg.body.userId = clientData.userId!;
        busRequestMsg.body.deviceGroupIds = message.body.deviceGroupIds;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateTariffReplyMessageBody>(busRequestMsg, clientData)
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

    processOperatorGetAllTariffsRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllTariffsRequestMessage): void {
        // TODO: Remove "as any"
        const busRequestMsg = createBusGetAllTariffsRequestMessage();
        busRequestMsg.body.types = message.body.types;
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllTariffsReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetAllTariffsReplyMessage();
                operatorReplyMsg.body.tariffs = busReplyMessage.body.tariffs;
                this.errorReplyHelper.setBusMessageFailure(busReplyMessage, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    processOperatorUpdateDeviceRequestMessage(clientData: ConnectedClientData, message: OperatorUpdateDeviceRequestMessage): void {
        const busRequestMsg = createBusUpdateDeviceRequestMessage();
        busRequestMsg.body.device = message.body.device;
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateDeviceReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorUpdateDeviceReplyMessage();
                operatorReplyMsg.body.device = busReplyMessage.body.device;
                this.errorReplyHelper.setBusMessageFailure(busReplyMessage, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    async processOperatorGetDeviceByIdRequestMessage(clientData: ConnectedClientData, message: OperatorGetDeviceByIdRequestMessage): Promise<void> {
        const busRequestMsg = createBusDeviceGetByIdRequestMessage();
        busRequestMsg.body.deviceId = message.body.deviceId;
        // TODO: Do we need this roundTripData ? We are now waiting for reply by type
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusDeviceGetByIdReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetDeviceByIdReplyMessage();
                operatorReplyMsg.body.device = busReplyMessage.body.device;
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
    }

    async processOperatorGetAllDevicesRequestMessage(clientData: ConnectedClientData, message: OperatorGetAllDevicesRequestMessage): Promise<void> {
        const busRequestMsg = createBusGetAllDevicesRequestMessage();
        busRequestMsg.header.roundTripData = {
            connectionId: clientData.connectionId,
            connectionInstanceId: clientData.connectionInstanceId,
        } as OperatorConnectionRoundTripData;
        this.publishToOperatorsChannelAndWaitForReply<BusOperatorGetAllDevicesReplyMessageBody>(busRequestMsg, clientData)
            .subscribe(busReplyMessage => {
                const operatorReplyMsg = createOperatorGetAllDevicesReplyMessage();
                operatorReplyMsg.body.devices = busReplyMessage.body.devices;
                this.sendReplyMessageToOperator(operatorReplyMsg, clientData, message);
            });
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
    publishToDevicesChannelAndWaitForReply<TReplyBody>(busMessage: Message<any>, clientData: ConnectedClientData): Observable<Message<TReplyBody>> {
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

    async processOperatorSignOutRequestMessage(clientData: ConnectedClientData, message: OperatorSignOutRequestMessage): Promise<void> {
        clientData.isAuthenticated = false;
        clientData.permissions = new Set<string>();
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
        this.sendReplyMessageToOperator(replyMsg, clientData, message);
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
            this.sendReplyMessageToOperator(refreshTokenReplyMsg, clientData, message);
            if (isTokenActiveResult.authTokenCacheValue) {
                const operatorId = clientData.userId || isTokenActiveResult.authTokenCacheValue.userId;
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
        const operatorId = clientData.userId || authTokenCacheValue.userId;
        clientData.userId = operatorId;
        // Send messages back to the operator
        this.sendReplyMessageToOperator(refreshTokenReplyMsg, clientData, message);
        const note = JSON.stringify({
            clientData: clientData,
            authReplyMsg: refreshTokenReplyMsg,
        });
        this.publishOperatorConnectionEventMessage(operatorId!, clientData.ipAddress, OperatorConnectionEventType.tokenRefreshed, note);
    }

    async processOperatorAuthRequestMessage(clientData: ConnectedClientData, message: OperatorAuthRequestMessage): Promise<void> {
        const sendCantAuthenticateReplyMessage = (): void => {
            const replyMsg = createOperatorAuthReplyMessage();
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.cantAuthenticate,
            }] as MessageError[];
            this.sendReplyMessageToOperator(replyMsg, clientData, message);
        };

        if (!message?.body) {
            sendCantAuthenticateReplyMessage();
            return;
        }

        if (!this.isWhiteSpace(message.body.token)) {
            const isTokenProcessed = await this.processOperatorAuthRequestWithToken(clientData, message);
            if (isTokenProcessed) {
                this.sendSignInInformationNotificationMessage(clientData);
            }
            return;
        }

        const isUsernameEmpty = this.isWhiteSpace(message.body.username);
        const isPasswordEmpty = this.isWhiteSpace(message.body.passwordHash);
        if (isUsernameEmpty && isPasswordEmpty) {
            sendCantAuthenticateReplyMessage();
            return;
        }

        const requestMsg = createBusUserAuthRequestMessage();
        requestMsg.body.passwordHash = message.body.passwordHash;
        requestMsg.body.username = message.body.username;
        requestMsg.header.roundTripData = this.createRoundTripDataFromConnectedClientData(clientData);
        this.publishToOperatorsChannelAndWaitForReply<BusUserAuthReplyMessageBody>(requestMsg, clientData)
            .subscribe(busReplyMsg => this.processBusOperatorAuthReplyMessage(clientData, busReplyMsg, message, message.body.username!));
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
            this.logger.warn('Authentication request with token failed. The token is not active', clientData, message, isTokenActiveResult);
            if (isTokenActiveResult.authTokenCacheValue?.token) {
                await this.cacheHelper.deleteAuthTokenKey(isTokenActiveResult.authTokenCacheValue?.token);
            }
            authReplyMsg.body.success = false;
            authReplyMsg.header.failure = true;
            authReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.invalidToken,
                description: 'The token provided is no longer valid',
            }] as MessageError[];
            this.sendReplyMessageToOperator(authReplyMsg, clientData, message);
            if (isTokenActiveResult.authTokenCacheValue) {
                const operatorId = clientData.userId || isTokenActiveResult.authTokenCacheValue.userId;
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
        const operatorId = clientData.userId || authTokenCacheValue.userId;
        clientData.userId = operatorId;
        // Send messages back to the operator
        this.sendReplyMessageToOperator(authReplyMsg, clientData, message);
        const configurationMsg = this.createOperatorConfigurationMessage();
        this.sendNotificationMessageToOperator(configurationMsg, clientData);
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
            case MessageType.busAllSystemSettingsNotification:
                this.processBusAllSystemSettingsNotificationMessage(message as BusAllSystemSettingsNotificationMessage);
                break;
        }
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
        message: BusUserAuthReplyMessage,
        operatorMessage: OperatorRequestMessage<unknown>,
        username: string
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
        const rtData = message.header.roundTripData! as OperatorConnectionRoundTripData;
        clientData.isAuthenticated = message.body.success;
        clientData.permissions = new Set<string>(message.body.permissions);
        clientData.userId = message.body.userId;
        replyMsg.body.permissions = message.body.permissions;
        replyMsg.body.success = message.body.success;
        if (replyMsg.body.success) {
            replyMsg.body.token = this.createUUIDString();
            replyMsg.body.tokenExpiresAt = this.getNowAsNumber() + this.getTokenExpirationMilliseconds();
            await this.maintainUserAuthDataTokenCacheItem(clientData.userId!, clientData.connectedAt, replyMsg.body.permissions!, replyMsg.body.token, rtData, username);
        }
        if (!message.body.success) {
            replyMsg.body.success = false;
            replyMsg.header.failure = true;
            replyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.cantAuthenticate,
            }] as MessageError[];
        }
        this.sendReplyMessageToOperator(replyMsg, clientData, operatorMessage);
        if (message.body.success) {
            // Send configuration message
            // TODO: Get configuration from the database
            const configurationMsg = this.createOperatorConfigurationMessage();
            this.sendNotificationMessageToOperator(configurationMsg, clientData);

            const note = JSON.stringify({
                messageBody: message.body,
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
        const isAnonymousMessage = msgType === OperatorRequestMessageType.authRequest;
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
        this.logger.log('Publishing message', ChannelName.shared, message.header.type, message);
        this.pubClient.publish(ChannelName.shared, JSON.stringify(message));
        return this.subjectsService.getSharedChannelBusMessageReceived();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishToDevicesChannel<TBody>(message: Message<TBody>): Observable<Message<any>> {
        message.header.source = this.messageBusIdentifier;
        this.logger.log('Publishing message', ChannelName.devices, message.header.type, message);
        this.pubClient.publish(ChannelName.devices, JSON.stringify(message));
        return this.subjectsService.getDevicesChannelBusMessageReceived();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        permissions: string[],
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
            tokenExpiresAt: now + this.getTokenExpirationMilliseconds(),
            userId: userId,
            username: username,
            connectedAt: connectedAt,
        };
        const userAuthDataCacheKey = this.cacheHelper.getUserAuthDataKey(userId, roundtripData.connectionInstanceId);
        await this.cacheClient.setValue(userAuthDataCacheKey, authData);
        const authTokenCacheKey = this.cacheHelper.getUserAuthTokenKey(token);
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
            mainTimerHandle: undefined,
            systemSettings: [],
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
        this.requestAllSystemSettings();
        this.startWebSocketServer();
        this.startMainTimer();
        this.startClientConnectionsMonitor();
        this.serveStaticFiles();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    applySystemSettings(systemSettings: SystemSetting[]): void {
        // TODO: Set this.state values according to systemSettings
        const configurationMsg = this.createOperatorConfigurationMessage();
        this.sendNotificationMessageToAllOperators(configurationMsg);
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
        const data: ConnectedClientData = {
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
            permissions: new Set<string>(),
            unauthorizedMessageRequestsCount: 0,
        };
        this.setConnectedClientData(data);
        this.wssServer.attachToConnection(args.connectionId);
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
