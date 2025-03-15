import { User } from 'src/entities/user.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusGetAllUsersRequestMessageBody = object;

export type BusGetAllUsersRequestMessage = Message<BusGetAllUsersRequestMessageBody>;

export function createBusGetAllUsersRequestMessage(): BusGetAllUsersRequestMessage {
    const msg: BusGetAllUsersRequestMessage = {
        header: { type: MessageType.busGetAllUsersRequest },
        body: {},
    };
    return msg;
};


export interface BusGetAllUsersReplyMessageBody {
    users: User[];
}

export type BusGetAllUsersReplyMessage = Message<BusGetAllUsersReplyMessageBody>;

export function createBusGetAllUsersReplyMessage(): BusGetAllUsersReplyMessage {
    const msg: BusGetAllUsersReplyMessage = {
        header: { type: MessageType.busGetAllUsersReply },
        body: {} as BusGetAllUsersReplyMessageBody,
    };
    return msg;
};
