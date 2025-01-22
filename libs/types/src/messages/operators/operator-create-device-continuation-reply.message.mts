import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { DeviceContinuation } from 'src/entities/device-continuation.mjs';

export interface OperatorCreateDeviceContinuationReplyMessageBody {
    // TODO: Return DeviceStatus instead
    deviceContinuation: DeviceContinuation;
}

export interface OperatorCreateDeviceContinuationReplyMessage extends OperatorReplyMessage<OperatorCreateDeviceContinuationReplyMessageBody> {
}

export function createOperatorCreateDeviceContinuationReplyMessage(): OperatorCreateDeviceContinuationReplyMessage {
    const msg: OperatorCreateDeviceContinuationReplyMessage = {
        header: { type: OperatorReplyMessageType.createDeviceContinuationReply },
        body: {} as OperatorCreateDeviceContinuationReplyMessageBody,
    };
    return msg;
};
