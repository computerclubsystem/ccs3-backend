import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { BusCodeSignInErrorCode } from './declarations/bus-code-sign-in-error-code.mjs';
import { BusCodeSignInIdentifierType } from './declarations/bus-code-sign-in-identifier-type.mjs';

export interface BusCodeSignInWithCredentialsRequestMessageBody {
    identifier: string;
    passwordHash: string;
    identifierType: BusCodeSignInIdentifierType;
    code?: string | null;
    ipAddress?: string | null;
}

export type BusCodeSignInWithCredentialsRequestMessage = Message<BusCodeSignInWithCredentialsRequestMessageBody>;

export function createBusCodeSignInWithCredentialsRequestMessage(): BusCodeSignInWithCredentialsRequestMessage {
    const msg: BusCodeSignInWithCredentialsRequestMessage = {
        header: { type: MessageType.busCodeSignInWithCredentialsRequest },
        body: {} as BusCodeSignInWithCredentialsRequestMessageBody,
    };
    return msg;
}


export interface BusCodeSignInWithCredentialsReplyMessageBody {
    success: boolean;
    errorMessage?: string | null;
    errorCode?: BusCodeSignInErrorCode | null;
    token?: string | null;
    identifier?: string | null;
    identifierType?: BusCodeSignInIdentifierType | null;
    remainingSeconds?: number | null;
}

export type BusCodeSignInWithCredentialsReplyMessage = Message<BusCodeSignInWithCredentialsReplyMessageBody>;

export function createBusCodeSignInWithCredentialsReplyMessage(): BusCodeSignInWithCredentialsReplyMessage {
    const msg: BusCodeSignInWithCredentialsReplyMessage = {
        header: { type: MessageType.busCodeSignInWithCredentialsReply },
        body: {} as BusCodeSignInWithCredentialsReplyMessageBody,
    };
    return msg;
}