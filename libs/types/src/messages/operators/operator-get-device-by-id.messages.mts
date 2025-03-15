import { Device } from 'src/entities/device.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorGetDeviceByIdRequestMessageBody {
    deviceId: number;
}

export type OperatorGetDeviceByIdRequestMessage = OperatorRequestMessage<OperatorGetDeviceByIdRequestMessageBody>;


export interface OperatorGetDeviceByIdReplyMessageBody {
    device: Device;
}

export type OperatorGetDeviceByIdReplyMessage = OperatorReplyMessage<OperatorGetDeviceByIdReplyMessageBody>;

export function createOperatorGetDeviceByIdReplyMessage(): OperatorGetDeviceByIdReplyMessage {
    const msg: OperatorGetDeviceByIdReplyMessage = {
        header: { type: OperatorReplyMessageType.getDeviceByIdReply },
        body: {} as OperatorGetDeviceByIdReplyMessageBody,
    };
    return msg;
};

