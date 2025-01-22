import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorDeleteDeviceContinuationReplyMessageBody {
    // TODO: Return updated DeviceStatus
}

export interface OperatorDeleteDeviceContinuationReplyMessage extends OperatorReplyMessage<OperatorDeleteDeviceContinuationReplyMessageBody> {
}

export function createOperatorDeleteDeviceContinuationReplyMessage(): OperatorDeleteDeviceContinuationReplyMessage {
    const msg: OperatorDeleteDeviceContinuationReplyMessage = {
        header: { type: OperatorReplyMessageType.deleteDeviceContinuationReply },
        body: {} as OperatorDeleteDeviceContinuationReplyMessageBody,
    };
    return msg;
};
