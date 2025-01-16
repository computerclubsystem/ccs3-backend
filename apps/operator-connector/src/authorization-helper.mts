import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';
import { OperatorMessageType, OperatorNotificationMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';
import { IsAuthorizedResult, IsAuthorizedResultReason } from './declarations.mjs';

export class AuthorizationHelper {
    private readonly messageTypeToPermissionMap: Map<OperatorMessageType | OperatorNotificationMessageType, PermissionName[]>;

    constructor() {
        const map = new Map<OperatorMessageType | OperatorNotificationMessageType, PermissionName[]>();
        map.set(OperatorMessageType.createUserWithRolesRequest, [PermissionName.usersCreate]);
        map.set(OperatorMessageType.updateUserWithRolesRequest, [PermissionName.usersUpdate]);
        map.set(OperatorMessageType.getAllUsersRequest, [PermissionName.usersRead]);
        map.set(OperatorMessageType.getUserWithRolesRequest, [PermissionName.usersRead]);
        map.set(OperatorMessageType.createRoleWithPermissionsRequest, [PermissionName.rolesCreate]);
        map.set(OperatorMessageType.updateRoleWithPermissionsRequest, [PermissionName.rolesUpdate]);
        map.set(OperatorMessageType.getRoleWithPermissionsRequest, [PermissionName.rolesRead]);
        map.set(OperatorMessageType.getAllRolesRequest, [PermissionName.rolesRead]);
        map.set(OperatorMessageType.createTariffRequest, [PermissionName.tariffsCreate]);
        map.set(OperatorMessageType.updateTariffRequest, [PermissionName.tariffsUpdate]);
        map.set(OperatorMessageType.getTariffByIdRequest, [PermissionName.tariffsRead]);
        map.set(OperatorMessageType.getAllTariffsRequest, [PermissionName.tariffsRead]);
        map.set(OperatorMessageType.getAllDevicesRequest, [PermissionName.devicesReadEntities]);
        map.set(OperatorMessageType.getDeviceByIdRequest, [PermissionName.devicesReadEntities]);
        map.set(OperatorMessageType.updateDeviceRequest, [PermissionName.devicesUpdateEntity]);
        map.set(OperatorMessageType.getDeviceStatusesRequest, [PermissionName.devicesReadStatus]);
        map.set(OperatorNotificationMessageType.deviceStatusesNotification, [PermissionName.devicesReadStatus]);
        map.set(OperatorMessageType.startDeviceRequest, [PermissionName.devicesStart]);
        map.set(OperatorMessageType.transferDeviceRequest, [PermissionName.devicesStart]);
        map.set(OperatorMessageType.stopDeviceRequest, [PermissionName.devicesStop]);
        this.messageTypeToPermissionMap = map;
    }

    isAuthorized(permissions: Set<string>, messageType: string): IsAuthorizedResult {
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

        const mapPermissions = this.messageTypeToPermissionMap.get(messageType as OperatorMessageType | OperatorNotificationMessageType);
        if (mapPermissions) {
            const hasAnyOfThePermissions = mapPermissions.some(permission => permissions.has(permission));
            if (hasAnyOfThePermissions) {
                result.authorized = true;
                return result;
            }
        }

        switch (messageType) {
            // case OperatorMessageType.createUserWithRolesRequest:
            //     result.authorized = permissions.has(PermissionName.usersCreate);
            //     break;
            // case OperatorMessageType.updateUserWithRolesRequest:
            //     result.authorized = permissions.has(PermissionName.usersUpdate);
            //     break;
            // case OperatorMessageType.getAllUsersRequest:
            // case OperatorMessageType.getUserWithRolesRequest:
            //     result.authorized = permissions.has(PermissionName.usersRead);
            //     break;
            // case OperatorMessageType.createRoleWithPermissionsRequest:
            //     result.authorized = permissions.has(PermissionName.rolesCreate);
            //     break;
            // case OperatorMessageType.updateRoleWithPermissionsRequest:
            //     result.authorized = permissions.has(PermissionName.rolesUpdate);
            //     break;
            // case OperatorMessageType.getRoleWithPermissionsRequest:
            // case OperatorMessageType.getAllRolesRequest:
            //     result.authorized = permissions.has(PermissionName.rolesRead);
            //     break;
            // case OperatorMessageType.createTariffRequest:
            //     result.authorized = permissions.has(PermissionName.tariffsCreate);
            //     break;
            // case OperatorMessageType.updateTariffRequest:
            //     result.authorized = permissions.has(PermissionName.tariffsUpdate);
            //     break;
            // case OperatorMessageType.getTariffByIdRequest:
            // case OperatorMessageType.getAllTariffsRequest:
            //     result.authorized = permissions.has(PermissionName.tariffsRead);
            //     break;
            // case OperatorMessageType.getAllDevicesRequest:
            // case OperatorMessageType.getDeviceByIdRequest:
            //     result.authorized = permissions.has(PermissionName.devicesReadEntities);
            //     break;
            // case OperatorMessageType.updateDeviceRequest:
            //     result.authorized = permissions.has(PermissionName.devicesUpdateEntity);
            //     break;
            // case OperatorMessageType.getDeviceStatusesRequest:
            // case OperatorNotificationMessageType.deviceStatusesNotification:
            //     result.authorized = permissions.has(PermissionName.devicesReadStatus);
            //     break;
            // case OperatorMessageType.startDeviceRequest:
            // case OperatorMessageType.transferDeviceRequest:
            //     result.authorized = permissions.has(PermissionName.devicesStart);
            //     break;
            // case OperatorMessageType.stopDeviceRequest:
            //     result.authorized = permissions.has(PermissionName.devicesStop);
            //     break;
            case OperatorMessageType.authRequest:
            case OperatorMessageType.pingRequest:
            case OperatorMessageType.refreshTokenRequest:
            case OperatorMessageType.signOutRequest:
            case OperatorMessageType.getAllPermissionsRequest:
                result.authorized = true;
                result.reason = IsAuthorizedResultReason.permissionIsNotRequired;
                break;
            default:
                // This should not happen - all message types must be covered in switch cases
                result.reason = IsAuthorizedResultReason.unknownPermissionsRequired;
                break;
        }

        if (!result.authorized && !result.reason) {
            result.reason = IsAuthorizedResultReason.missingPermission;
        }
        return result;
    }
}
