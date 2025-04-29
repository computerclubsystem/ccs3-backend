import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusUserAuthWithLongLivedAccessTokenRequestMessageBody {
    token: string
    ipAddress?: string | null;
    deviceId?: number | null;
}

export type BusUserAuthWithLongLivedAccessTokenRequestMessage = Message<BusUserAuthWithLongLivedAccessTokenRequestMessageBody>;

export function createBusUserAuthWithLongLivedAccessTokenRequestMessage(): BusUserAuthWithLongLivedAccessTokenRequestMessage {
    const msg: BusUserAuthWithLongLivedAccessTokenRequestMessage = {
        header: { type: MessageType.busUserAuthWithLongLivedAccessTokenRequest },
        body: {} as BusUserAuthWithLongLivedAccessTokenRequestMessageBody,
    };
    return msg;
}


export interface BusUserAuthWithLongLivedAccessTokenReplyMessageBody {
    success: boolean;
    permissions?: string[];
    userId?: number;
    username?: string | null;
}

export type BusUserAuthWithLongLivedAccessTokenReplyMessage = Message<BusUserAuthWithLongLivedAccessTokenReplyMessageBody>;

export function createBusUserAuthWithLongLivedAccessTokenReplyMessage(): BusUserAuthWithLongLivedAccessTokenReplyMessage {
    const msg: BusUserAuthWithLongLivedAccessTokenReplyMessage = {
        header: { type: MessageType.busUserAuthWithLongLivedAccessTokenReply },
        body: {} as BusUserAuthWithLongLivedAccessTokenReplyMessageBody,
    };
    return msg;
}