import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { DeviceContinuation } from 'src/entities/device-continuation.mjs';

export interface OperatorCreateDeviceContinuationRequestMessageBody {
    deviceContinuation: DeviceContinuation;
}

export type OperatorCreateDeviceContinuationRequestMessage = OperatorRequestMessage<OperatorCreateDeviceContinuationRequestMessageBody>;


export interface OperatorCreateDeviceContinuationReplyMessageBody {
    // TODO: Return DeviceStatus instead
    deviceContinuation: DeviceContinuation;
}

export type OperatorCreateDeviceContinuationReplyMessage = OperatorReplyMessage<OperatorCreateDeviceContinuationReplyMessageBody>;

export function createOperatorCreateDeviceContinuationReplyMessage(): OperatorCreateDeviceContinuationReplyMessage {
    const msg: OperatorCreateDeviceContinuationReplyMessage = {
        header: { type: OperatorReplyMessageType.createDeviceContinuationReply },
        body: {} as OperatorCreateDeviceContinuationReplyMessageBody,
    };
    return msg;
};

