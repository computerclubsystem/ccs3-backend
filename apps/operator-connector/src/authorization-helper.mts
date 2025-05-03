import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';
import { OperatorRequestMessageType, OperatorNotificationMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';
import { IsAuthorizedResult, IsAuthorizedResultReason } from './declarations.mjs';

const MESSAGES_REQUIRING_PERMISSIONS_MAP = new Map<OperatorRequestMessageType | OperatorNotificationMessageType, PermissionName[]>([
    [OperatorRequestMessageType.createUserWithRolesRequest, [PermissionName.usersCreate]],
    [OperatorRequestMessageType.updateUserWithRolesRequest, [PermissionName.usersUpdate]],
    [OperatorRequestMessageType.getAllUsersRequest, [PermissionName.usersRead]],
    [OperatorRequestMessageType.getUserWithRolesRequest, [PermissionName.usersRead]],
    [OperatorRequestMessageType.getSigndInUsersRequest, [PermissionName.reportsSignedInUsersRead]],
    [OperatorRequestMessageType.forceSignOutAllUserSessionsRequest, [PermissionName.usersForceSignOut]],
    [OperatorRequestMessageType.createRoleWithPermissionsRequest, [PermissionName.rolesCreate]],
    [OperatorRequestMessageType.updateRoleWithPermissionsRequest, [PermissionName.rolesUpdate]],
    [OperatorRequestMessageType.getRoleWithPermissionsRequest, [PermissionName.rolesRead]],
    [OperatorRequestMessageType.getAllRolesRequest, [PermissionName.rolesRead]],
    [OperatorRequestMessageType.createTariffRequest, [PermissionName.tariffsCreate]],
    [OperatorRequestMessageType.createPrepaidTariffRequest, [PermissionName.tariffsCreatePrepaid]],
    [OperatorRequestMessageType.rechargeTariffDurationRequest, [PermissionName.tariffsRechargeDuration]],
    [OperatorRequestMessageType.updateTariffRequest, [PermissionName.tariffsUpdate]],
    [OperatorRequestMessageType.getTariffByIdRequest, [PermissionName.tariffsRead]],
    [OperatorRequestMessageType.getAllTariffsRequest, [PermissionName.tariffsRead]],
    [OperatorRequestMessageType.getAllDevicesRequest, [PermissionName.devicesReadEntities]],
    [OperatorRequestMessageType.getDeviceByIdRequest, [PermissionName.devicesReadEntities]],
    [OperatorRequestMessageType.updateDeviceRequest, [PermissionName.devicesUpdateEntity]],
    [OperatorRequestMessageType.getDeviceStatusesRequest, [PermissionName.devicesReadStatus]],
    [OperatorNotificationMessageType.deviceStatusesNotification, [PermissionName.devicesReadStatus]],
    [OperatorNotificationMessageType.deviceConnectivitiesNotification, [PermissionName.devicesReadStatus]],
    [OperatorRequestMessageType.getCurrentShiftStatusRequest, [PermissionName.devicesReadStatus]],
    [OperatorRequestMessageType.startDeviceRequest, [PermissionName.devicesStart]],
    [OperatorRequestMessageType.transferDeviceRequest, [PermissionName.devicesStart]],
    [OperatorRequestMessageType.createDeviceContinuationRequest, [PermissionName.devicesStart]],
    [OperatorRequestMessageType.deleteDeviceContinuationRequest, [PermissionName.devicesStart]],
    [OperatorRequestMessageType.stopDeviceRequest, [PermissionName.devicesStop]],
    [OperatorRequestMessageType.getShifts, [PermissionName.reportsShifts]],
    [OperatorRequestMessageType.getAllSystemSettingsRequest, [PermissionName.systemSettingsRead]],
    [OperatorRequestMessageType.updateSystemSettingsValuesRequest, [PermissionName.systemSettingsUpdate]],
    [OperatorRequestMessageType.createDeviceRequest, [PermissionName.devicesCreate]],
    [OperatorRequestMessageType.completeShiftRequest, [PermissionName.devicesStart]],
    [OperatorRequestMessageType.createDeviceGroupRequest, [PermissionName.deviceGroupsCreate]],
    [OperatorRequestMessageType.updateDeviceGroupRequest, [PermissionName.deviceGroupsUpdate]],
    [OperatorRequestMessageType.getDeviceGroupDataRequest, [
        PermissionName.devicesReadStatus,
        PermissionName.deviceGroupsCreate,
        PermissionName.deviceGroupsUpdate
    ]],
    [OperatorRequestMessageType.getAllDeviceGroupsRequest, [PermissionName.devicesReadStatus]],
    [OperatorRequestMessageType.getAllAllowedDeviceObjectsRequest, [PermissionName.devicesReadStatus]],
    [OperatorRequestMessageType.setDeviceStatusNoteRequest, [PermissionName.devicesStart]],
    [OperatorRequestMessageType.getDeviceCompletedSessionsRequest, [PermissionName.reportsDeviceSessions]],
    [OperatorRequestMessageType.filterServerLogsRequest, [PermissionName.diagnosticsFilterServerLogs]],
    [OperatorRequestMessageType.shutdownStoppedRequest, [PermissionName.devicesStop]],
    [OperatorRequestMessageType.getTariffDeviceGroupsRequest, [
        PermissionName.tariffsRead,
        PermissionName.tariffsCreate,
        PermissionName.tariffsCreatePrepaid,
        PermissionName.tariffsUpdate,
        PermissionName.tariffsRechargeDuration,
    ]],
    [OperatorRequestMessageType.restartDevicesRequest, [PermissionName.devicesStop]],
    [OperatorRequestMessageType.getDeviceConnectivityDetailsRequest, [PermissionName.devicesReadStatus]],
    [OperatorRequestMessageType.shutdownDevicesRequest, [PermissionName.devicesStop]],
]);
const MESSAGES_REQUIRING_ONLY_AUTHENTICATION_SET = new Set<OperatorRequestMessageType | OperatorNotificationMessageType>([
    OperatorRequestMessageType.pingRequest,
    OperatorRequestMessageType.refreshTokenRequest,
    OperatorRequestMessageType.signOutRequest,
    OperatorRequestMessageType.getAllPermissionsRequest,
    OperatorRequestMessageType.getProfileSettingsRequest,
    OperatorRequestMessageType.updateProfileSettingsRequest,
    OperatorRequestMessageType.changePasswordRequest,
]);
const MESSAGES_NOT_REQUIRING_AUTHENTICATION_SET = new Set<OperatorRequestMessageType | OperatorNotificationMessageType>([
    OperatorRequestMessageType.authRequest,
    OperatorRequestMessageType.createSignInCodeRequest,
]);

export class AuthorizationHelper {
    isAuthorized(permissions: Set<PermissionName>, messageType: OperatorRequestMessageType | OperatorNotificationMessageType, isUserAuthenticated: boolean): IsAuthorizedResult {
        // Find the message with permissions map
        const requiredPermissions = MESSAGES_REQUIRING_PERMISSIONS_MAP.get(messageType);
        if (requiredPermissions) {
            if (!isUserAuthenticated) {
                // The message requires permission but the user is not authenticated
                return { authorized: false, reason: IsAuthorizedResultReason.notAuthenticated };
            }
            // Check if any of the user permissions is found in the permissions map for this message type
            const hasAnyOfThePermissions = requiredPermissions.some(permission => permissions.has(permission));
            if (hasAnyOfThePermissions) {
                // At least one of the user permissions is found
                return { authorized: true, reason: IsAuthorizedResultReason.hasRequiredPermissions };
            }
        }

        if (permissions.has(PermissionName.all)) {
            // Permission "all" allows all operations
            return { authorized: true, reason: IsAuthorizedResultReason.hasAllPermissions };
        }

        if (MESSAGES_NOT_REQUIRING_AUTHENTICATION_SET.has(messageType)) {
            // This message type does not require permissions
            return { authorized: true, reason: IsAuthorizedResultReason.permissionIsNotRequired };
        }

        if (MESSAGES_REQUIRING_ONLY_AUTHENTICATION_SET.has(messageType)) {
            if (isUserAuthenticated) {
                return { authorized: true, reason: IsAuthorizedResultReason.permissionIsNotRequired };
            } else {
                return { authorized: false, reason: IsAuthorizedResultReason.notAuthenticated };
            }
        }

        // If all the other checks fail, assume unknown message
        return { authorized: false, reason: IsAuthorizedResultReason.unknownPermissionsRequired };
    }
}
