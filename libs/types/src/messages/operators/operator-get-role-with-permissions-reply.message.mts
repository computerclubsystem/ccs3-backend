import { Role } from 'src/entities/role.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { Permission } from 'src/entities/permission.mjs';

export interface OperatorGetRoleWithPermissionsReplyMessageBody {
    role?: Role;
    rolePermissionIds?: number[];
    // TODO: Remove this - the client can read all permission entities if necessary
    allPermissions?: Permission[];
}

export interface OperatorGetRoleWithPermissionsReplyMessage extends OperatorReplyMessage<OperatorGetRoleWithPermissionsReplyMessageBody> {
}

export function createOperatorGetRoleWithPermissionsReplyMessage(): OperatorGetRoleWithPermissionsReplyMessage {
    const msg: OperatorGetRoleWithPermissionsReplyMessage = {
        header: { type: OperatorReplyMessageType.getRoleWithPermissionsReply },
        body: {} as OperatorGetRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};
