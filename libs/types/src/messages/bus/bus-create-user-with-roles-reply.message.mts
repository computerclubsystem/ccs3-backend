import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { User } from 'src/entities/user.mjs';

export interface BusCreateUserWithRolesReplyMessageBody {
    user?: User;
    roleIds?: number[];
}

export interface BusCreateUserWithRolesReplyMessage extends Message<BusCreateUserWithRolesReplyMessageBody> {
}

export function createBusCreateUserWithRolesReplyMessage(): BusCreateUserWithRolesReplyMessage {
    const msg: BusCreateUserWithRolesReplyMessage = {
        header: { type: MessageType.busCreateUserWithRolesReply },
        body: {} as BusCreateUserWithRolesReplyMessageBody,
    };
    return msg;
};
