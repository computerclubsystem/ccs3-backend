import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorStartDeviceReplyMessageBody {
    // TODO: Return the new DeviceStatus ?
}

export interface OperatorStartDeviceReplyMessage extends OperatorReplyMessage<OperatorStartDeviceReplyMessageBody> {
}

export function createOperatorStartDeviceReplyMessage(): OperatorStartDeviceReplyMessage {
    const msg: OperatorStartDeviceReplyMessage = {
        header: { type: OperatorReplyMessageType.startDeviceReply },
        body: {} as OperatorStartDeviceReplyMessageBody,
    };
    return msg;
};
