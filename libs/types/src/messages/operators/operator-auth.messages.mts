import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorAuthRequestMessageBody {
    username?: string;
    passwordHash?: string;
    token?: string;
}

export type OperatorAuthRequestMessage = OperatorRequestMessage<OperatorAuthRequestMessageBody>;


export interface OperatorAuthReplyMessageBody {
    success: boolean;
    permissions?: string[];
    token?: string;
    tokenExpiresAt?: number;
}

export type OperatorAuthReplyMessage = OperatorReplyMessage<OperatorAuthReplyMessageBody>;

export function createOperatorAuthReplyMessage(): OperatorAuthReplyMessage {
    const msg: OperatorAuthReplyMessage = {
        header: { type: OperatorReplyMessageType.authReply },
        body: {} as OperatorAuthReplyMessageBody,
    };
    return msg;
};
