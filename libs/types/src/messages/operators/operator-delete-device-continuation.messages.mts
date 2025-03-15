import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorDeleteDeviceContinuationRequestMessageBody {
    deviceId: number;
}

export type OperatorDeleteDeviceContinuationRequestMessage = OperatorRequestMessage<OperatorDeleteDeviceContinuationRequestMessageBody>;


export type OperatorDeleteDeviceContinuationReplyMessageBody = object;

export type OperatorDeleteDeviceContinuationReplyMessage = OperatorReplyMessage<OperatorDeleteDeviceContinuationReplyMessageBody>;

export function createOperatorDeleteDeviceContinuationReplyMessage(): OperatorDeleteDeviceContinuationReplyMessage {
    const msg: OperatorDeleteDeviceContinuationReplyMessage = {
        header: { type: OperatorReplyMessageType.deleteDeviceContinuationReply },
        body: {},
    };
    return msg;
};

