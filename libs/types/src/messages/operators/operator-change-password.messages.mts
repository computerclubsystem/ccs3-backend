import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorChangePasswordRequestMessageBody {
    currentPasswordHash: string;
    newPasswordHash: string;
}

export type OperatorChangePasswordRequestMessage = OperatorRequestMessage<OperatorChangePasswordRequestMessageBody>;


export type OperatorChangePasswordReplyMessageBody = object;

export type OperatorChangePasswordReplyMessage = OperatorReplyMessage<OperatorChangePasswordReplyMessageBody>;

export function createOperatorChangePasswordReplyMessage(): OperatorChangePasswordReplyMessage {
    const msg: OperatorChangePasswordReplyMessage = {
        header: { type: OperatorReplyMessageType.changePasswordReply },
        body: {},
    };
    return msg;
};