import { LongLivedAccessToken } from 'src/entities/long-lived-access-token.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusUserAuthRequestMessageBody {
    username?: string;
    passwordHash?: string;
    // token?: string;
}

export type BusUserAuthRequestMessage = Message<BusUserAuthRequestMessageBody>;

export function createBusUserAuthRequestMessage(): BusUserAuthRequestMessage {
    const msg: BusUserAuthRequestMessage = {
        header: { type: MessageType.busUserAuthRequest },
        body: {} as BusUserAuthRequestMessageBody,
    };
    return msg;
};


export interface BusUserAuthReplyMessageBody {
    success: boolean;
    permissions?: string[];
    // token?: string;
    userId?: number;
    username?: string | null;
    longLivedAccessToken?: LongLivedAccessToken;
}

export type BusUserAuthReplyMessage = Message<BusUserAuthReplyMessageBody>;

export function createBusUserAuthReplyMessage(): BusUserAuthReplyMessage {
    const msg: BusUserAuthReplyMessage = {
        header: { type: MessageType.busUserAuthReply },
        body: {} as BusUserAuthReplyMessageBody,
    };
    return msg;
};