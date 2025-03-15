import { OperatorRequestMessageType, OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorNotAuthorizedReplyMessageBody {
    requestedMessageType: OperatorRequestMessageType;
}

export type OperatorNotAuthorizedReplyMessage = OperatorReplyMessage<OperatorNotAuthorizedReplyMessageBody>;

export function createOperatorNotAuthorizedReplyMessage(): OperatorNotAuthorizedReplyMessage {
    const msg: OperatorNotAuthorizedReplyMessage = {
        header: { type: OperatorReplyMessageType.notAuthorizedReply },
        body: {} as OperatorNotAuthorizedReplyMessageBody,
    };
    return msg;
};
