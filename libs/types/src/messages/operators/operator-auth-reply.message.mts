import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorAuthReplyMessageBody {
    success: boolean;
    permissions?: string[];
    token?: string;
    tokenExpiresAt?: number;
}

export interface OperatorAuthReplyMessage extends OperatorReplyMessage<OperatorAuthReplyMessageBody> {
}

export function createOperatorAuthReplyMessage(): OperatorAuthReplyMessage {
    const msg: OperatorAuthReplyMessage = {
        header: { type: OperatorReplyMessageType.authReply },
        body: {} as OperatorAuthReplyMessageBody,
    };
    return msg;
};
