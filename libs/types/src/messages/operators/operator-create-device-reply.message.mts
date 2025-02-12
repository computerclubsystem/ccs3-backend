import { Device } from 'src/entities/device.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorCreateDeviceReplyMessageBody {
    device: Device;
}

export type OperatorCreateDeviceReplyMessage = OperatorReplyMessage<OperatorCreateDeviceReplyMessageBody>;

export function createOperatorCreateDeviceReplyMessage(): OperatorCreateDeviceReplyMessage {
    const msg: OperatorCreateDeviceReplyMessage = {
        header: { type: OperatorReplyMessageType.createDeviceReply },
        body: {} as OperatorCreateDeviceReplyMessageBody,
    };
    return msg;
}