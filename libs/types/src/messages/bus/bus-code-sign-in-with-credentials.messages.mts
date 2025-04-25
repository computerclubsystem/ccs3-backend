import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusCodeSignInWithCredentialsRequestMessageBody {
    identifier: string;
    passwordHash: string;
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


export const enum BusCodeSignInWithCredentialsReplyMessageBodyIdentifierType {
    user = 'user',
    customerCard = 'customer-card',
}

export interface BusCodeSignInWithCredentialsReplyMessageBody {
    success: boolean;
    errorMessage?: string | null;
    token?: string | null;
    identifier?: string | null;
    identifierType?: BusCodeSignInWithCredentialsReplyMessageBodyIdentifierType | null;
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