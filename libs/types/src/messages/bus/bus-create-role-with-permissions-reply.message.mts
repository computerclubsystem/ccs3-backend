import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Role } from 'src/entities/role.mjs';

export interface BusCreateRoleWithPermissionsReplyMessageBody {
    role?: Role;
}

export interface BusCreateRoleWithPermissionsReplyMessage extends Message<BusCreateRoleWithPermissionsReplyMessageBody> {
}

export function createBusCreateRoleWithPermissionsReplyMessage(): BusCreateRoleWithPermissionsReplyMessage {
    const msg: BusCreateRoleWithPermissionsReplyMessage = {
        header: { type: MessageType.busCreateRoleWithPermissionsReply },
        body: {} as BusCreateRoleWithPermissionsReplyMessageBody,
    };
    return msg;
};
