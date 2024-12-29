import { OperatorMessageType } from './declarations/operator-message-type.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorAuthReplyMessageBody {
    success: boolean;
    permissions?: string[];
    token?: string;
    tokenExpiresAt?: number;
}

export interface OperatorAuthReplyMessage extends OperatorMessage<OperatorAuthReplyMessageBody> {
}

export function createOperatorAuthReplyMessage(): OperatorAuthReplyMessage {
    const msg: OperatorAuthReplyMessage = {
        header: { type: OperatorMessageType.authReply },
        body: {} as OperatorAuthReplyMessageBody,
    };
    return msg;
};
