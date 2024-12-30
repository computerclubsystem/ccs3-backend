import { OperatorMessageType } from './declarations/operator-message-type.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorSignOutReplyMessageBody {
    sessionStart: number;
    sessionEnd: number;
    sentMessagesCount: number;
    receivedMessagesCount: number;
    sentPingMessagesCount: number;
}

export interface OperatorSignOutReplyMessage extends OperatorMessage<OperatorSignOutReplyMessageBody> {
}

export function createOperatorSignOutReplyMessage(): OperatorSignOutReplyMessage {
    const msg: OperatorSignOutReplyMessage = {
        header: { type: OperatorMessageType.signOutReply },
        body: {} as OperatorSignOutReplyMessageBody,
    };
    return msg;
};
