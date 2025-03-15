import { Role } from 'src/entities/role.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorCreateRoleWithPermissionsRequestMessageBody {
    role: Role;
    rolePermissionIds: number[];
}

export type OperatorCreateRoleWithPermissionsRequestMessage = OperatorRequestMessage<OperatorCreateRoleWithPermissionsRequestMessageBody>;


export interface OperatorCreateRoleWithPermissionsReplyMessageBody {
    role?: Role;
    rolePermissionIds?: number[];
}

export type OperatorCreateRoleWithPermissionsReplyMessage = OperatorReplyMessage<OperatorCreateRoleWithPermissionsReplyMessageBody>;

export function createOperatorCreateRoleWithPermissionsReplyMessage(): OperatorCreateRoleWithPermissionsReplyMessage {
    const msg: OperatorCreateRoleWithPermissionsReplyMessage = {
        header: { type: OperatorReplyMessageType.createRoleWithPermissionsReply },
        body: {} as OperatorCreateRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};
