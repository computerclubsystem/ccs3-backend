import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { User } from 'src/entities/user.mjs';

export interface BusCreateUserWithRolesRequestMessageBody {
    user: User;
    passwordHash: string;
    roleIds: number[];
}

export type BusCreateUserWithRolesRequestMessage = Message<BusCreateUserWithRolesRequestMessageBody>;

export function createBusCreateUserWithRolesRequestMessage(): BusCreateUserWithRolesRequestMessage {
    const msg: BusCreateUserWithRolesRequestMessage = {
        header: { type: MessageType.busCreateUserWithRolesRequest },
        body: {} as BusCreateUserWithRolesRequestMessageBody,
    };
    return msg;
};


export interface BusCreateUserWithRolesReplyMessageBody {
    user?: User;
    roleIds?: number[];
}

export type BusCreateUserWithRolesReplyMessage = Message<BusCreateUserWithRolesReplyMessageBody>;

export function createBusCreateUserWithRolesReplyMessage(): BusCreateUserWithRolesReplyMessage {
    const msg: BusCreateUserWithRolesReplyMessage = {
        header: { type: MessageType.busCreateUserWithRolesReply },
        body: {} as BusCreateUserWithRolesReplyMessageBody,
    };
    return msg;
};
