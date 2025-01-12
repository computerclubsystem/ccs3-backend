import { Role } from 'src/entities/role.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorUpdateRoleWithPermissionsReplyMessageBody {
    role?: Role;
    rolePermissionIds?: number[];
}

export interface OperatorUpdateRoleWithPermissionsReplyMessage extends OperatorReplyMessage<OperatorUpdateRoleWithPermissionsReplyMessageBody> {
}

export function createOperatorUpdateRoleWithPermissionsReplyMessage(): OperatorUpdateRoleWithPermissionsReplyMessage {
    const msg: OperatorUpdateRoleWithPermissionsReplyMessage = {
        header: { type: OperatorReplyMessageType.updateRoleWithPermissionsReply },
        body: {} as OperatorUpdateRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};
