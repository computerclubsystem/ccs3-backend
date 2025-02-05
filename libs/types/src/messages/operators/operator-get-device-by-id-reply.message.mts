import { Device } from 'src/entities/device.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorGetDeviceByIdReplyMessageBody {
    device: Device;
}

export interface OperatorGetDeviceByIdReplyMessage extends OperatorReplyMessage<OperatorGetDeviceByIdReplyMessageBody> {
}

export function createOperatorGetDeviceByIdReplyMessage(): OperatorGetDeviceByIdReplyMessage {
    const msg: OperatorGetDeviceByIdReplyMessage = {
        header: { type: OperatorReplyMessageType.getDeviceByIdReply },
        body: {} as OperatorGetDeviceByIdReplyMessageBody,
    };
    return msg;
};
