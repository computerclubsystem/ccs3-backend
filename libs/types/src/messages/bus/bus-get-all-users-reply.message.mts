import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { User } from 'src/entities/user.mjs';

export interface BusGetAllUsersReplyMessageBody {
    users: User[];
}

export interface BusGetAllUsersReplyMessage extends Message<BusGetAllUsersReplyMessageBody> {
}

export function createBusGetAllUsersReplyMessage(): BusGetAllUsersReplyMessage {
    const msg: BusGetAllUsersReplyMessage = {
        header: { type: MessageType.busGetAllUsersReply },
        body: {} as BusGetAllUsersReplyMessageBody,
    };
    return msg;
};
