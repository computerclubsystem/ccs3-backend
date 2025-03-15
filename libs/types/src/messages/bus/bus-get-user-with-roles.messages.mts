import { User } from 'src/entities/user.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetUserWithRolesRequestMessageBody {
    userId: number;
}

export type BusGetUserWithRolesRequestMessage = Message<BusGetUserWithRolesRequestMessageBody>;

export function createBusGetUserWithRolesRequestMessage(): BusGetUserWithRolesRequestMessage {
    const msg: BusGetUserWithRolesRequestMessage = {
        header: { type: MessageType.busGetUserWithRolesRequest },
        body: {} as BusGetUserWithRolesRequestMessageBody,
    };
    return msg;
};


export interface BusGetUserWithRolesReplyMessageBody {
    user?: User;
    roleIds?: number[];
}

export type BusGetUserWithRolesReplyMessage = Message<BusGetUserWithRolesReplyMessageBody>;

export function createBusGetUserWithRolesReplyMessage(): BusGetUserWithRolesReplyMessage {
    const msg: BusGetUserWithRolesReplyMessage = {
        header: { type: MessageType.busGetUserWithRolesReply },
        body: {} as BusGetUserWithRolesReplyMessageBody,
    };
    return msg;
};
