import { Role } from 'src/entities/role.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorUpdateRoleWithPermissionsRequestMessageBody {
    role: Role;
    rolePermissionIds: number[];
}

export type OperatorUpdateRoleWithPermissionsRequestMessage = OperatorRequestMessage<OperatorUpdateRoleWithPermissionsRequestMessageBody>;


export interface OperatorUpdateRoleWithPermissionsReplyMessageBody {
    role?: Role;
    rolePermissionIds?: number[];
}

export type OperatorUpdateRoleWithPermissionsReplyMessage = OperatorReplyMessage<OperatorUpdateRoleWithPermissionsReplyMessageBody>;

export function createOperatorUpdateRoleWithPermissionsReplyMessage(): OperatorUpdateRoleWithPermissionsReplyMessage {
    const msg: OperatorUpdateRoleWithPermissionsReplyMessage = {
        header: { type: OperatorReplyMessageType.updateRoleWithPermissionsReply },
        body: {} as OperatorUpdateRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};

