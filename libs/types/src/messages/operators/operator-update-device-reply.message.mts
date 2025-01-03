import { Device } from 'src/entities/device.mjs';
import { OperatorMessageType } from './declarations/operator-message-type.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorUpdateDeviceReplyMessageBody {
    device?: Device;
}

export interface OperatorUpdateDeviceReplyMessage extends OperatorMessage<OperatorUpdateDeviceReplyMessageBody> {
}

export function createOperatorUpdateDeviceReplyMessage(): OperatorUpdateDeviceReplyMessage {
    const msg: OperatorUpdateDeviceReplyMessage = {
        header: { type: OperatorMessageType.updateDeviceReply },
        body: {} as OperatorUpdateDeviceReplyMessageBody,
    };
    return msg;
};
