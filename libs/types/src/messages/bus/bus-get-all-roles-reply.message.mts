import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Role } from 'src/entities/role.mjs';

export interface BusGetAllRolesReplyMessageBody {
    roles: Role[];
}

export interface BusGetAllRolesReplyMessage extends Message<BusGetAllRolesReplyMessageBody> {
}

export function createBusGetAllRolesReplyMessage(): BusGetAllRolesReplyMessage {
    const msg: BusGetAllRolesReplyMessage = {
        header: { type: MessageType.busGetAllRolesReply },
        body: {} as BusGetAllRolesReplyMessageBody,
    };
    return msg;
};
