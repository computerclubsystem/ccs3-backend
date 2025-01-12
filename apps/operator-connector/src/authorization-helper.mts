import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';
import { IsAuthorizedResult, IsAuthorizedResultReason } from './declarations.mjs';
import { OperatorMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';

export class AuthorizationHelper {
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

        switch (messageType) {
            case OperatorMessageType.createRoleWithPermissionsRequest:
                result.authorized = permissions.has(PermissionName.rolesCreate);
                break;
            case OperatorMessageType.updateRoleWithPermissionsRequest:
                result.authorized = permissions.has(PermissionName.rolesUpdate);
                break;
            case OperatorMessageType.getRoleWithPermissionsRequest:
            case OperatorMessageType.getAllRolesRequest:
                result.authorized = permissions.has(PermissionName.rolesRead);
                break;
            case OperatorMessageType.createTariffRequest:
                result.authorized = permissions.has(PermissionName.tariffsCreate);
                break;
            case OperatorMessageType.updateTariffRequest:
                result.authorized = permissions.has(PermissionName.tariffsUpdate);
                break;
            case OperatorMessageType.getTariffByIdRequest:
            case OperatorMessageType.getAllTariffsRequest:
                result.authorized = permissions.has(PermissionName.tariffsRead);
                break;
            case OperatorMessageType.getAllDevicesRequest:
            case OperatorMessageType.getDeviceByIdRequest:
                result.authorized = permissions.has(PermissionName.devicesReadEntities);
                break;
            case OperatorMessageType.updateDeviceRequest:
                result.authorized = permissions.has(PermissionName.devicesUpdateEntity);
                break;
            case OperatorMessageType.getDeviceStatusesRequest:
                result.authorized = permissions.has(PermissionName.devicesReadStatus);
                break;
            case OperatorMessageType.startDeviceRequest:
                result.authorized = permissions.has(PermissionName.devicesStart);
                break;
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
