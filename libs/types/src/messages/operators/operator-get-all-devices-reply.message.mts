import { Device } from 'src/entities/device.mjs';
import { OperatorMessageType } from './declarations/operator-message-type.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorGetAllDevicesReplyMessageBody {
    devices: Device[];
}

export interface OperatorGetAllDevicesReplyMessage extends OperatorMessage<OperatorGetAllDevicesReplyMessageBody> {
}

export function createOperatorGetAllDevicesReplyMessage(): OperatorGetAllDevicesReplyMessage {
    const msg: OperatorGetAllDevicesReplyMessage = {
        header: { type: OperatorMessageType.getAllDevicesReply },
        body: {} as OperatorGetAllDevicesReplyMessageBody,
    };
    return msg;
};
