import { Role } from 'src/entities/role.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusUpdateRoleWithPermissionsRequestMessageBody {
    role: Role;
    permissionIds: number[];
}

export interface BusUpdateRoleWithPermissionsRequestMessage extends Message<BusUpdateRoleWithPermissionsRequestMessageBody> {
}

export function createBusUpdateRoleWithPermissionsRequestMessage(): BusUpdateRoleWithPermissionsRequestMessage {
    const msg: BusUpdateRoleWithPermissionsRequestMessage = {
        header: { type: MessageType.busUpdateRoleWithPermissionsRequest },
        body: {} as BusUpdateRoleWithPermissionsRequestMessageBody,
    };
    return msg;
};


export interface BusUpdateRoleWithPermissionsReplyMessageBody {
    role?: Role;
}

export type BusUpdateRoleWithPermissionsReplyMessage = Message<BusUpdateRoleWithPermissionsReplyMessageBody>;

export function createBusUpdateRoleWithPermissionsReplyMessage(): BusUpdateRoleWithPermissionsReplyMessage {
    const msg: BusUpdateRoleWithPermissionsReplyMessage = {
        header: { type: MessageType.busUpdateRoleWithPermissionsReply },
        body: {} as BusUpdateRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};
