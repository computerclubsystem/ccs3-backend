import { Device } from 'src/entities/device.mjs';
import { OperatorMessageType } from './declarations/operator-message-type.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorGetDeviceByIdReplyMessageBody {
    device: Device;
}

export interface OperatorGetDeviceByIdReplyMessage extends OperatorMessage<OperatorGetDeviceByIdReplyMessageBody> {
}

export function createOperatorGetDeviceByIdReplyMessage(): OperatorGetDeviceByIdReplyMessage {
    const msg: OperatorGetDeviceByIdReplyMessage = {
        header: { type: OperatorMessageType.getDeviceByIdReply },
        body: {} as OperatorGetDeviceByIdReplyMessageBody,
    };
    return msg;
};
