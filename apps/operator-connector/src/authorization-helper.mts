import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';
import { OperatorRequestMessageType, OperatorNotificationMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';
import { IsAuthorizedResult, IsAuthorizedResultReason } from './declarations.mjs';

export class AuthorizationHelper {
    private readonly messageTypeToPermissionMap: Map<OperatorRequestMessageType | OperatorNotificationMessageType, PermissionName[]>;

    constructor() {
        const map = new Map<OperatorRequestMessageType | OperatorNotificationMessageType, PermissionName[]>();
        map.set(OperatorRequestMessageType.createUserWithRolesRequest, [PermissionName.usersCreate]);
        map.set(OperatorRequestMessageType.updateUserWithRolesRequest, [PermissionName.usersUpdate]);
        map.set(OperatorRequestMessageType.getAllUsersRequest, [PermissionName.usersRead]);
        map.set(OperatorRequestMessageType.getUserWithRolesRequest, [PermissionName.usersRead]);
        map.set(OperatorRequestMessageType.getSigndInUsersRequest, [PermissionName.reportsSignedInUsersRead]);
        map.set(OperatorRequestMessageType.forceSignOutAllUserSessionsRequest, [PermissionName.usersForceSignOut]);
        map.set(OperatorRequestMessageType.createRoleWithPermissionsRequest, [PermissionName.rolesCreate]);
        map.set(OperatorRequestMessageType.updateRoleWithPermissionsRequest, [PermissionName.rolesUpdate]);
        map.set(OperatorRequestMessageType.getRoleWithPermissionsRequest, [PermissionName.rolesRead]);
        map.set(OperatorRequestMessageType.getAllRolesRequest, [PermissionName.rolesRead]);
        map.set(OperatorRequestMessageType.createTariffRequest, [PermissionName.tariffsCreate]);
        map.set(OperatorRequestMessageType.createPrepaidTariffRequest, [PermissionName.tariffsCreatePrepaid]);
        map.set(OperatorRequestMessageType.rechargeTariffDurationRequest, [PermissionName.tariffsRechargeDuration]);
        map.set(OperatorRequestMessageType.updateTariffRequest, [PermissionName.tariffsUpdate]);
        map.set(OperatorRequestMessageType.getTariffByIdRequest, [PermissionName.tariffsRead]);
        map.set(OperatorRequestMessageType.getAllTariffsRequest, [PermissionName.tariffsRead]);
        map.set(OperatorRequestMessageType.getAllDevicesRequest, [PermissionName.devicesReadEntities]);
        map.set(OperatorRequestMessageType.getDeviceByIdRequest, [PermissionName.devicesReadEntities]);
        map.set(OperatorRequestMessageType.updateDeviceRequest, [PermissionName.devicesUpdateEntity]);
        map.set(OperatorRequestMessageType.getDeviceStatusesRequest, [PermissionName.devicesReadStatus]);
        map.set(OperatorNotificationMessageType.deviceStatusesNotification, [PermissionName.devicesReadStatus]);
        map.set(OperatorNotificationMessageType.deviceConnectivitiesNotification, [PermissionName.devicesReadStatus]);
        map.set(OperatorRequestMessageType.getCurrentShiftStatusRequest, [PermissionName.devicesReadStatus]);
        map.set(OperatorRequestMessageType.startDeviceRequest, [PermissionName.devicesStart]);
        map.set(OperatorRequestMessageType.transferDeviceRequest, [PermissionName.devicesStart]);
        map.set(OperatorRequestMessageType.createDeviceContinuationRequest, [PermissionName.devicesStart]);
        map.set(OperatorRequestMessageType.deleteDeviceContinuationRequest, [PermissionName.devicesStart]);
        map.set(OperatorRequestMessageType.stopDeviceRequest, [PermissionName.devicesStop]);
        map.set(OperatorRequestMessageType.getShifts, [PermissionName.reportsShifts]);
        map.set(OperatorRequestMessageType.getAllSystemSettingsRequest, [PermissionName.systemSettingsRead]);
        map.set(OperatorRequestMessageType.updateSystemSettingsValuesRequest, [PermissionName.systemSettingsUpdate]);
        map.set(OperatorRequestMessageType.createDeviceRequest, [PermissionName.devicesCreate]);
        map.set(OperatorRequestMessageType.completeShiftRequest, [PermissionName.devicesStart]);
        map.set(OperatorRequestMessageType.createDeviceGroupRequest, [PermissionName.deviceGroupsCreate]);
        map.set(OperatorRequestMessageType.updateDeviceGroupRequest, [PermissionName.deviceGroupsUpdate]);
        map.set(OperatorRequestMessageType.getDeviceGroupDataRequest, [
            PermissionName.devicesReadStatus,
            PermissionName.deviceGroupsCreate,
            PermissionName.deviceGroupsUpdate
        ]);
        map.set(OperatorRequestMessageType.getAllDeviceGroupsRequest, [PermissionName.devicesReadStatus]);
        map.set(OperatorRequestMessageType.getAllAllowedDeviceObjectsRequest, [PermissionName.devicesReadStatus]);
        map.set(OperatorRequestMessageType.setDeviceStatusNoteRequest, [PermissionName.devicesStart]);
        map.set(OperatorRequestMessageType.getDeviceCompletedSessionsRequest, [PermissionName.reportsDeviceSessions]);
        map.set(OperatorRequestMessageType.filterServerLogsRequest, [PermissionName.diagnosticsFilterServerLogs]);
        map.set(OperatorRequestMessageType.shutdownStoppedRequest, [PermissionName.devicesStop]);
        map.set(OperatorRequestMessageType.getTariffDeviceGroupsRequest, [
            PermissionName.tariffsRead,
            PermissionName.tariffsCreate,
            PermissionName.tariffsCreatePrepaid,
            PermissionName.tariffsUpdate,
            PermissionName.tariffsRechargeDuration,
        ]);
        map.set(OperatorRequestMessageType.restartDevicesRequest, [PermissionName.devicesStop]);
        map.set(OperatorRequestMessageType.getDeviceConnectivityDetailsRequest, [PermissionName.devicesReadStatus]);
        map.set(OperatorRequestMessageType.shutdownDevicesRequest, [PermissionName.devicesStop]);
        this.messageTypeToPermissionMap = map;
    }

    isAuthorized(permissions: Set<string>, messageType: string, isUserAuthenticated: boolean): IsAuthorizedResult {
        const result: IsAuthorizedResult = {
            authorized: false,
            reason: IsAuthorizedResultReason.missingPermission,
        };

        if (permissions.has(PermissionName.all)) {
            // Permission "all" allows all operations
            result.authorized = true;
            result.reason = IsAuthorizedResultReason.hasAllPermissions;
            return result;
        }

        const mapPermissions = this.messageTypeToPermissionMap.get(messageType as OperatorRequestMessageType | OperatorNotificationMessageType);
        if (mapPermissions) {
            const hasAnyOfThePermissions = mapPermissions.some(permission => permissions.has(permission));
            if (hasAnyOfThePermissions) {
                result.authorized = true;
                return result;
            }
        }

        switch (messageType) {
            case OperatorRequestMessageType.authRequest:
                result.authorized = true;
                result.reason = IsAuthorizedResultReason.permissionIsNotRequired;
                break;
            case OperatorRequestMessageType.pingRequest:
            case OperatorRequestMessageType.refreshTokenRequest:
            case OperatorRequestMessageType.signOutRequest:
            case OperatorRequestMessageType.getAllPermissionsRequest:
            case OperatorRequestMessageType.getProfileSettingsRequest:
            case OperatorRequestMessageType.updateProfileSettingsRequest:
            case OperatorRequestMessageType.changePasswordRequest:
                // The user only needs to be successfully authenticated
                if (isUserAuthenticated) {
                    result.authorized = true;
                    result.reason = IsAuthorizedResultReason.permissionIsNotRequired;
                } else {
                    result.authorized = false;
                    result.reason = IsAuthorizedResultReason.notAuthenticated;
                }
                break;
            default:
                // This should not happen - all message types must be covered in switch cases
                result.authorized = false;
                result.reason = IsAuthorizedResultReason.unknownPermissionsRequired;
                break;
        }

        if (!result.authorized && !result.reason) {
            result.reason = IsAuthorizedResultReason.missingPermission;
        }
        return result;
    }
}
