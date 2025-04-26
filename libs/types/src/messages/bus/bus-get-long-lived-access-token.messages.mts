import { LongLivedAccessToken } from 'src/entities/long-lived-access-token.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetLongLivedAccessTokenRequestMessageBody {
    token: string;
}

export type BusGetLongLivedAccessTokenRequestMessage = Message<BusGetLongLivedAccessTokenRequestMessageBody>;

export function createBusGetLongLivedAccessTokenRequestMessage(): BusGetLongLivedAccessTokenRequestMessage {
    const msg: BusGetLongLivedAccessTokenRequestMessage = {
        header: { type: MessageType.busGetLongLivedAccessTokenRequest },
        body: {} as BusGetLongLivedAccessTokenRequestMessageBody,
    };
    return msg;
}


export interface BusGetLongLivedAccessTokenReplyMessageBody {
    longLivedAccessToken?: LongLivedAccessToken | null;
    hasExpired: boolean;
}

export type BusGetLongLivedAccessTokenReplyMessage = Message<BusGetLongLivedAccessTokenReplyMessageBody>;

export function createBusGetLongLivedAccessTokenReplyMessage(): BusGetLongLivedAccessTokenReplyMessage {
    const msg: BusGetLongLivedAccessTokenReplyMessage = {
        header: { type: MessageType.busGetLongLivedAccessTokenReply },
        body: {} as BusGetLongLivedAccessTokenReplyMessageBody,
    };
    return msg;
}