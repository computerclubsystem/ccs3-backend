import { Role } from 'src/entities/role.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { Permission } from 'src/entities/permission.mjs';

export interface BusGetRoleWithPermissionsRequestMessageBody {
    roleId: number;
}

export type BusGetRoleWithPermissionsRequestMessage = Message<BusGetRoleWithPermissionsRequestMessageBody>;

export function createBusGetRoleWithPermissionsRequestMessage(): BusGetRoleWithPermissionsRequestMessage {
    const msg: BusGetRoleWithPermissionsRequestMessage = {
        header: { type: MessageType.busGetRoleWithPermissionsRequest },
        body: {} as BusGetRoleWithPermissionsRequestMessageBody,
    };
    return msg;
};


export interface BusGetRoleWithPermissionsReplyMessageBody {
    role?: Role;
    rolePermissionIds?: number[];
    // TODO: Remove this - the client can get all permissions if necessary
    allPermissions?: Permission[];
}

export type BusGetRoleWithPermissionsReplyMessage = Message<BusGetRoleWithPermissionsReplyMessageBody>;

export function createBusGetRoleWithPermissionsReplyMessage(): BusGetRoleWithPermissionsReplyMessage {
    const msg: BusGetRoleWithPermissionsReplyMessage = {
        header: { type: MessageType.busGetRoleWithPermissionsReply },
        body: {} as BusGetRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};
