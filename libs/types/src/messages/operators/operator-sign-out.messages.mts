import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorSignOutRequestMessageBody {
    currentToken: string;
}

export type OperatorSignOutRequestMessage = OperatorRequestMessage<OperatorSignOutRequestMessageBody>;


export interface OperatorSignOutReplyMessageBody {
    sessionStart: number;
    sessionEnd: number;
    sentMessagesCount: number;
    receivedMessagesCount: number;
    sentPingMessagesCount: number;
}

export type OperatorSignOutReplyMessage = OperatorReplyMessage<OperatorSignOutReplyMessageBody>;

export function createOperatorSignOutReplyMessage(): OperatorSignOutReplyMessage {
    const msg: OperatorSignOutReplyMessage = {
        header: { type: OperatorReplyMessageType.signOutReply },
        body: {} as OperatorSignOutReplyMessageBody,
    };
    return msg;
};

