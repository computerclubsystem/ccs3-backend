import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { BusCodeSignInIdentifierType } from './declarations/bus-code-sign-in-identifier-type.mjs';

export interface BusGetSignInCodeInfoRequestMessageBody {
    code: string;
    identifierType: BusCodeSignInIdentifierType;
}

export type BusGetSignInCodeInfoRequestMessage = Message<BusGetSignInCodeInfoRequestMessageBody>;

export function createBusGetSignInCodeInfoRequestMessage(): BusGetSignInCodeInfoRequestMessage {
    const msg: BusGetSignInCodeInfoRequestMessage = {
        header: { type: MessageType.busGetSignInCodeInfoRequest },
        body: {} as BusGetSignInCodeInfoRequestMessageBody,
    };
    return msg;
}

export interface BusGetSignInCodeInfoReplyMessageBody {
    isValid: boolean;
    code: string;
    identifierType: BusCodeSignInIdentifierType;
    codeDurationSeconds: number;
    remainingSeconds?: number | null;
}

export type BusGetSignInCodeInfoReplyMessage = Message<BusGetSignInCodeInfoReplyMessageBody>;

export function createBusGetSignInCodeInfoReplyMessage(): BusGetSignInCodeInfoReplyMessage {
    const msg: BusGetSignInCodeInfoReplyMessage = {
        header: { type: MessageType.busGetSignInCodeInfoReply },
        body: {} as BusGetSignInCodeInfoReplyMessageBody,
    };
    return msg;
}