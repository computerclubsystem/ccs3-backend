import { OperatorRequestMessageType, OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorNotAuthenticatedMessageBody {
    requestedMessageType: OperatorRequestMessageType;
}

export interface OperatorNotAuthenticatedMessage extends OperatorReplyMessage<OperatorNotAuthenticatedMessageBody> {
}

export function createOperatorNotAuthenticatedMessage(): OperatorNotAuthenticatedMessage {
    const msg: OperatorNotAuthenticatedMessage = {
        header: { type: OperatorReplyMessageType.notAuthenticatedReply },
        body: {} as OperatorNotAuthenticatedMessageBody,
    };
    return msg;
};
