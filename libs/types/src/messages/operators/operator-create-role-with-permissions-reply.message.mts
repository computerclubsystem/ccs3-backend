import { Role } from 'src/entities/role.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorCreateRoleWithPermissionsReplyMessageBody {
    role?: Role;
    rolePermissionIds?: number[];
}

export interface OperatorCreateRoleWithPermissionsReplyMessage extends OperatorReplyMessage<OperatorCreateRoleWithPermissionsReplyMessageBody> {
}

export function createOperatorCreateRoleWithPermissionsReplyMessage(): OperatorCreateRoleWithPermissionsReplyMessage {
    const msg: OperatorCreateRoleWithPermissionsReplyMessage = {
        header: { type: OperatorReplyMessageType.createRoleWithPermissionsReply },
        body: {} as OperatorCreateRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};
