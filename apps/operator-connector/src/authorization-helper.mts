import { Permission } from '@computerclubsystem/types/entities/permission.mjs';
import { OperatorMessage } from '@computerclubsystem/types/messages/operators/declarations/operator.message.mjs';
import { IsAuthorizedResult, IsAuthorizedResultReason } from './declarations.mjs';
import { OperatorMessageType } from '@computerclubsystem/types/messages/operators/declarations/operator-message-type.mjs';

export class AuthorizationHelper {
    isAuthorized(permissions: Set<string>, message: OperatorMessage<any>): IsAuthorizedResult {
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

        const type = message.header.type;
        switch (type) {
            case OperatorMessageType.getAllDevicesRequest:
                result.authorized = permissions.has(Permission.deviceReadEntities);
                result.reason = IsAuthorizedResultReason.hasRequiredPermissions;
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

        return result;
    }
}
