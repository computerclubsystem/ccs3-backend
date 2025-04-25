import { LongLivedAccessToken } from 'src/entities/long-lived-access-token.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusCreateLongLivedAccessTokenForUserRequestMessageBody {
    username: string;
    passwordHash: string;
}

export type BusCreateLongLivedAccessTokenForUserRequestMessage = Message<BusCreateLongLivedAccessTokenForUserRequestMessageBody>;

export function createBusCreateLongLivedAccessTokenForUserRequestMessage(): BusCreateLongLivedAccessTokenForUserRequestMessage {
    const msg: BusCreateLongLivedAccessTokenForUserRequestMessage = {
        header: { type: MessageType.busCreateLongLivedAccessTokenForUserRequest },
        body: {} as BusCreateLongLivedAccessTokenForUserRequestMessageBody,
    };
    return msg;
}


export interface BusCreateLongLivedAccessTokenForUserReplyMessageBody {
    longLivedToken: LongLivedAccessToken;
}

export type BusCreateLongLivedAccessTokenForUserReplyMessage = Message<BusCreateLongLivedAccessTokenForUserReplyMessageBody>;

export function createBusCreateLongLivedAccessTokenForUserReplyMessage(): BusCreateLongLivedAccessTokenForUserReplyMessage {
    const msg: BusCreateLongLivedAccessTokenForUserReplyMessage = {
        header: { type: MessageType.busCreateLongLivedAccessTokenForUserReply },
        body: {} as BusCreateLongLivedAccessTokenForUserReplyMessageBody,
    };
    return msg;
}