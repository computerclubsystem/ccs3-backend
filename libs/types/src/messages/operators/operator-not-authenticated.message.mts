import { OperatorMessageType } from './declarations/operator-message-type.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorNotAuthenticatedMessageBody {
    requestedMessageType: OperatorMessageType;
}

export interface OperatorNotAuthenticatedMessage extends OperatorMessage<OperatorNotAuthenticatedMessageBody> {
}

export function createOperatorNotAuthenticatedMessage(): OperatorNotAuthenticatedMessage {
    const msg: OperatorNotAuthenticatedMessage = {
        header: { type: OperatorMessageType.notAuthenticated },
        body: {} as OperatorNotAuthenticatedMessageBody,
    };
    return msg;
};
