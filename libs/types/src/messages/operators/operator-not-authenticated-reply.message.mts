import { OperatorRequestMessageType, OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorNotAuthenticatedReplyMessageBody {
    requestedMessageType: OperatorRequestMessageType;
}

export type OperatorNotAuthenticatedMessage = OperatorReplyMessage<OperatorNotAuthenticatedReplyMessageBody>;

export function createOperatorNotAuthenticatedReplyMessage(): OperatorNotAuthenticatedMessage {
    const msg: OperatorNotAuthenticatedMessage = {
        header: { type: OperatorReplyMessageType.notAuthenticatedReply },
        body: {} as OperatorNotAuthenticatedReplyMessageBody,
    };
    return msg;
};
