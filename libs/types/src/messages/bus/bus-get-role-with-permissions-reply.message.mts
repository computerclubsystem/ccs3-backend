import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Role } from 'src/entities/role.mjs';
import { Permission } from 'src/entities/permission.mjs';

export interface BusGetRoleWithPermissionsReplyMessageBody {
    role?: Role;
    rolePermissionIds?: number[];
    allPermissions?: Permission[];
}

export interface BusGetRoleWithPermissionsReplyMessage extends Message<BusGetRoleWithPermissionsReplyMessageBody> {
}

export function createBusGetRoleWithPermissionsReplyMessage(): BusGetRoleWithPermissionsReplyMessage {
    const msg: BusGetRoleWithPermissionsReplyMessage = {
        header: { type: MessageType.busGetRoleWithPermissionsReply },
        body: {} as BusGetRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};
