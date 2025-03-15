import { Role } from 'src/entities/role.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { Permission } from 'src/entities/permission.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorGetRoleWithPermissionsRequestMessageBody {
    roleId: number;
}

export type OperatorGetRoleWithPermissionsRequestMessage = OperatorRequestMessage<OperatorGetRoleWithPermissionsRequestMessageBody>;


export interface OperatorGetRoleWithPermissionsReplyMessageBody {
    role?: Role;
    rolePermissionIds?: number[];
    // TODO: Remove this - the client can read all permission entities if necessary
    allPermissions?: Permission[];
}

export type OperatorGetRoleWithPermissionsReplyMessage = OperatorReplyMessage<OperatorGetRoleWithPermissionsReplyMessageBody>;

export function createOperatorGetRoleWithPermissionsReplyMessage(): OperatorGetRoleWithPermissionsReplyMessage {
    const msg: OperatorGetRoleWithPermissionsReplyMessage = {
        header: { type: OperatorReplyMessageType.getRoleWithPermissionsReply },
        body: {} as OperatorGetRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};

