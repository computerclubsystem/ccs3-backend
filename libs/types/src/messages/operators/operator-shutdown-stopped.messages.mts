import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export type OperatorShutdownStoppedRequestMessageBody = object;

export type OperatorShutdownStoppedRequestMessage = OperatorRequestMessage<OperatorShutdownStoppedRequestMessageBody>;


export interface OperatorShutdownStoppedReplyMessageBody {
    targetsCount: number;
}

export type OperatorShutdownStoppedReplyMessage = OperatorReplyMessage<OperatorShutdownStoppedReplyMessageBody>;

export function createOperatorShutdownStoppedReplyMessage(): OperatorShutdownStoppedReplyMessage {
    const msg: OperatorShutdownStoppedReplyMessage = {
        header: { type: OperatorReplyMessageType.shutdownStoppedReply },
        body: {} as OperatorShutdownStoppedReplyMessageBody,
    };
    return msg;
}