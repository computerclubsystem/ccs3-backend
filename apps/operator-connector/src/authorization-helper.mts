import { Permission } from '@computerclubsystem/types/entities/permission.mjs';
import { IsAuthorizedResult, IsAuthorizedResultReason } from './declarations.mjs';
import { OperatorMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';

export class AuthorizationHelper {
    isAuthorized(permissions: Set<string>, messageType: string): IsAuthorizedResult {
        const result: IsAuthorizedResult = {
            authorized: false,
            reason: IsAuthorizedResultReason.missingPermission,
        };

        if (permissions.has(Permission.all)) {
            // Permission "all" allows all operations
            result.authorized = true;
            result.reason = IsAuthorizedResultReason.hasAllPermissions;
            return result;
        }

        switch (messageType) {
            case OperatorMessageType.createTariffRequest:
                result.authorized = permissions.has(Permission.tariffsCreate);
                break;
            case OperatorMessageType.updateTariffRequest:
                result.authorized = permissions.has(Permission.tariffsUpdate);
                break;
            case OperatorMessageType.getTariffByIdRequest:
            case OperatorMessageType.getAllTariffsRequest:
                result.authorized = permissions.has(Permission.tariffsRead);
                break;
            case OperatorMessageType.getAllDevicesRequest:
            case OperatorMessageType.getDeviceByIdRequest:
                result.authorized = permissions.has(Permission.devicesReadEntities);
                break;
            case OperatorMessageType.updateDeviceRequest:
                result.authorized = permissions.has(Permission.devicesUpdateEntity);
                break;
            case OperatorMessageType.getDeviceStatusesRequest:
                result.authorized = permissions.has(Permission.devicesReadStatus);
                break;
            case OperatorMessageType.startDeviceRequest:
                result.authorized = permissions.has(Permission.devicesStart);
                break;
            case OperatorMessageType.authRequest:
            case OperatorMessageType.pingRequest:
            case OperatorMessageType.refreshTokenRequest:
            case OperatorMessageType.signOutRequest:
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
