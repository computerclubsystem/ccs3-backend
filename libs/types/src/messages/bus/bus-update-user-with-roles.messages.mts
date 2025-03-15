import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { User } from 'src/entities/user.mjs';

export interface BusUpdateUserWithRolesRequestMessageBody {
    user: User;
    passwordHash?: string;
    roleIds: number[];
}

export type BusUpdateUserWithRolesRequestMessage = Message<BusUpdateUserWithRolesRequestMessageBody>;

export function createBusUpdateUserWithRolesRequestMessage(): BusUpdateUserWithRolesRequestMessage {
    const msg: BusUpdateUserWithRolesRequestMessage = {
        header: { type: MessageType.busUpdateUserWithRolesRequest },
        body: {} as BusUpdateUserWithRolesRequestMessageBody,
    };
    return msg;
};


export interface BusUpdateUserWithRolesReplyMessageBody {
    user?: User;
    passwordHash?: string;
    roleIds?: number[];
}

export type BusUpdateUserWithRolesReplyMessage = Message<BusUpdateUserWithRolesReplyMessageBody>;

export function createBusUpdateUserWithRolesReplyMessage(): BusUpdateUserWithRolesReplyMessage {
    const msg: BusUpdateUserWithRolesReplyMessage = {
        header: { type: MessageType.busUpdateUserWithRolesReply },
        body: {} as BusUpdateUserWithRolesReplyMessageBody,
    };
    return msg;
};
