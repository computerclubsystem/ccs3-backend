import { OperatorRequestMessageType, OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorNotAuthorizedMessageBody {
    requestedMessageType: OperatorRequestMessageType;
}

export interface OperatorNotAuthorizedMessage extends OperatorReplyMessage<OperatorNotAuthorizedMessageBody> {
}

export function createOperatorNotAuthorizedMessage(): OperatorNotAuthorizedMessage {
    const msg: OperatorNotAuthorizedMessage = {
        header: { type: OperatorReplyMessageType.notAuthorizedReply },
        body: {} as OperatorNotAuthorizedMessageBody,
    };
    return msg;
};
