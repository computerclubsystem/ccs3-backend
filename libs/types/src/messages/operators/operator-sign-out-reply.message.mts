import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorSignOutReplyMessageBody {
    sessionStart: number;
    sessionEnd: number;
    sentMessagesCount: number;
    receivedMessagesCount: number;
    sentPingMessagesCount: number;
}

export interface OperatorSignOutReplyMessage extends OperatorReplyMessage<OperatorSignOutReplyMessageBody> {
}

export function createOperatorSignOutReplyMessage(): OperatorSignOutReplyMessage {
    const msg: OperatorSignOutReplyMessage = {
        header: { type: OperatorReplyMessageType.signOutReply },
        body: {} as OperatorSignOutReplyMessageBody,
    };
    return msg;
};
