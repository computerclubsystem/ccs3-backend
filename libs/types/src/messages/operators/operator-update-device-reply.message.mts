import { Device } from 'src/entities/device.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorUpdateDeviceReplyMessageBody {
    device?: Device;
}

export interface OperatorUpdateDeviceReplyMessage extends OperatorReplyMessage<OperatorUpdateDeviceReplyMessageBody> {
}

export function createOperatorUpdateDeviceReplyMessage(): OperatorUpdateDeviceReplyMessage {
    const msg: OperatorUpdateDeviceReplyMessage = {
        header: { type: OperatorReplyMessageType.updateDeviceReply },
        body: {} as OperatorUpdateDeviceReplyMessageBody,
    };
    return msg;
};
