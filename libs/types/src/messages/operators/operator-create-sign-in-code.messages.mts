import { BusCodeSignInIdentifierType } from '../bus/declarations/bus-code-sign-in-identifier-type.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export type OperatorCreateSignInCodeRequestMessageBody = object;

export type OperatorCreateSignInCodeRequestMessage = OperatorRequestMessage<OperatorCreateSignInCodeRequestMessageBody>;


export interface OperatorCreateSignInCodeReplyMessageBody {
    code: string;
    url: string;
    identifierType: BusCodeSignInIdentifierType;
    remainingSeconds: number;
}

export type OperatorCreateSignInCodeReplyMessage = OperatorReplyMessage<OperatorCreateSignInCodeReplyMessageBody>;

export function createOperatorCreateSignInCodeReplyMessage(): OperatorCreateSignInCodeReplyMessage {
    const msg: OperatorCreateSignInCodeReplyMessage = {
        header: { type: OperatorReplyMessageType.createSignInCodeReply },
        body: {} as OperatorCreateSignInCodeReplyMessageBody,
    };
    return msg;
}