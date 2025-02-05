import { Device } from 'src/entities/device.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorGetAllDevicesReplyMessageBody {
    devices: Device[];
}

export interface OperatorGetAllDevicesReplyMessage extends OperatorReplyMessage<OperatorGetAllDevicesReplyMessageBody> {
}

export function createOperatorGetAllDevicesReplyMessage(): OperatorGetAllDevicesReplyMessage {
    const msg: OperatorGetAllDevicesReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllDevicesReply },
        body: {} as OperatorGetAllDevicesReplyMessageBody,
    };
    return msg;
};
