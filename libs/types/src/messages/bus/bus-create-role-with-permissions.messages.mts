import { Role } from 'src/entities/role.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusCreateRoleWithPermissionsRequestMessageBody {
    role: Role;
    permissionIds: number[];
}

export type BusCreateRoleWithPermissionsRequestMessage = Message<BusCreateRoleWithPermissionsRequestMessageBody>;

export function createBusCreateRoleWithPermissionsRequestMessage(): BusCreateRoleWithPermissionsRequestMessage {
    const msg: BusCreateRoleWithPermissionsRequestMessage = {
        header: { type: MessageType.busCreateRoleWithPermissionsRequest },
        body: {} as BusCreateRoleWithPermissionsRequestMessageBody,
    };
    return msg;
};


export interface BusCreateRoleWithPermissionsReplyMessageBody {
    role?: Role;
}

export type BusCreateRoleWithPermissionsReplyMessage = Message<BusCreateRoleWithPermissionsReplyMessageBody>;

export function createBusCreateRoleWithPermissionsReplyMessage(): BusCreateRoleWithPermissionsReplyMessage {
    const msg: BusCreateRoleWithPermissionsReplyMessage = {
        header: { type: MessageType.busCreateRoleWithPermissionsReply },
        body: {} as BusCreateRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};
