import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { BusCodeSignInErrorCode } from './declarations/bus-code-sign-in-error-code.mjs';
import { BusCodeSignInIdentifierType } from './declarations/bus-code-sign-in-identifier-type.mjs';

export interface BusCodeSignInWithLongLivedAccessTokenRequestMessageBody {
    token: string;
    code: string | null;
    identifierType: BusCodeSignInIdentifierType;
    ipAddress?: string | null;
}

export type BusCodeSignInWithLongLivedAccessTokenRequestMessage = Message<BusCodeSignInWithLongLivedAccessTokenRequestMessageBody>;

export function createBusCodeSignInWithLongLivedAccessTokenRequestMessage(): BusCodeSignInWithLongLivedAccessTokenRequestMessage {
    const msg: BusCodeSignInWithLongLivedAccessTokenRequestMessage = {
        header: { type: MessageType.busCodeSignInWithLongLivedAccessTokenRequest },
        body: {} as BusCodeSignInWithLongLivedAccessTokenRequestMessageBody,
    };
    return msg;
}


export interface BusCodeSignInWithLongLivedAccessTokenReplyMessageBody {
    success: boolean;
    errorMessage?: string | null;
    errorCode?: BusCodeSignInErrorCode | null;
    identifier?: string | null;
    identifierType?: BusCodeSignInIdentifierType | null;
    remainingSeconds?: number | null;
}

export type BusCodeSignInWithLongLivedAccessTokenReplyMessage = Message<BusCodeSignInWithLongLivedAccessTokenReplyMessageBody>;

export function createBusCodeSignInWithLongLivedAccessTokenReplyMessage(): BusCodeSignInWithLongLivedAccessTokenReplyMessage {
    const msg: BusCodeSignInWithLongLivedAccessTokenReplyMessage = {
        header: { type: MessageType.busCodeSignInWithLongLivedAccessTokenReply },
        body: {} as BusCodeSignInWithLongLivedAccessTokenReplyMessageBody,
    };
    return msg;
}