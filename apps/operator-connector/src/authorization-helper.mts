import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';
import { OperatorRequestMessageType, OperatorNotificationMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';
import { IsAuthorizedResult, IsAuthorizedResultReason } from './declarations.mjs';

export class AuthorizationHelper {
    private readonly messagesRequiringPermissionsMap = this.createMessagesRequiringPermissionsMap();
    private readonly messagesNotRequiringAuthenticationSet = this.createMessagesNotRequiringAuthenticationSet();
    private readonly messagesRequiringOnlyAuthenticationSet = this.createMessagesRequiringOnlyAuthenticationSet();

    isAuthorized(permissions: Set<PermissionName>, messageType: OperatorRequestMessageType | OperatorNotificationMessageType, isUserAuthenticated: boolean): IsAuthorizedResult {
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

        if (this.messagesNotRequiringAuthenticationSet.has(messageType)) {
            // This message type does not require permissions
            result.authorized = true;
            result.reason = IsAuthorizedResultReason.permissionIsNotRequired;
            return result;
        }

        if (this.messagesRequiringOnlyAuthenticationSet.has(messageType)) {
            if (isUserAuthenticated) {
                result.authorized = true;
                result.reason = IsAuthorizedResultReason.permissionIsNotRequired;
            } else {
                result.authorized = false;
                result.reason = IsAuthorizedResultReason.notAuthenticated;
            }
            return result;
        }

        // Find the message with permissions map
        const mapPermissions = this.messagesRequiringPermissionsMap.get(messageType);
        if (mapPermissions) {
            // Check if any of the user permissions is found in the permissions map for this message type
            const hasAnyOfThePermissions = mapPermissions.some(permission => permissions.has(permission));
            if (hasAnyOfThePermissions) {
                // At least one of the user permissions is found
                result.authorized = true;
                result.reason = IsAuthorizedResultReason.hasRequiredPermissions;
                return result;
            }
        }

        // If all the other checks fail, assume unknown message
        result.authorized = false;
        result.reason = IsAuthorizedResultReason.unknownPermissionsRequired;
        return result;
    }

    private createMessagesRequiringOnlyAuthenticationSet(): Set<OperatorRequestMessageType | OperatorNotificationMessageType> {
        const set = new Set<OperatorRequestMessageType | OperatorNotificationMessageType>();
        set.add(OperatorRequestMessageType.pingRequest);
        set.add(OperatorRequestMessageType.refreshTokenRequest);
        set.add(OperatorRequestMessageType.signOutRequest);
        set.add(OperatorRequestMessageType.getAllPermissionsRequest);
        set.add(OperatorRequestMessageType.getProfileSettingsRequest);
        set.add(OperatorRequestMessageType.updateProfileSettingsRequest);
        set.add(OperatorRequestMessageType.changePasswordRequest);
        return set;
    }

    private createMessagesNotRequiringAuthenticationSet(): Set<OperatorRequestMessageType | OperatorNotificationMessageType> {
        const set = new Set<OperatorRequestMessageType | OperatorNotificationMessageType>();
        set.add(OperatorRequestMessageType.authRequest);
        set.add(OperatorRequestMessageType.createSignInCodeRequest);
        return set;
    }

    private createMessagesRequiringPermissionsMap(): Map<OperatorRequestMessageType | OperatorNotificationMessageType, PermissionName[]> {
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
        return map;
    }
}
