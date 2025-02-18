import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export type OperatorChangePasswordReplyMessageBody = object;

export type OperatorChangePasswordReplyMessage = OperatorReplyMessage<OperatorChangePasswordReplyMessageBody>;

export function createOperatorChangePasswordReplyMessage(): OperatorChangePasswordReplyMessage {
    const msg: OperatorChangePasswordReplyMessage = {
        header: { type: OperatorReplyMessageType.changePasswordReply },
        body: {},
    };
    return msg;
}