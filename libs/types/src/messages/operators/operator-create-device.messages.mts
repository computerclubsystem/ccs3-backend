import { Device } from 'src/entities/device.mjs';
import { OperatorReplyMessageType, OperatorRequestMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorCreateDeviceRequestMessageBody {
    device: Device;
}

export type OperatorCreateDeviceRequestMessage = OperatorRequestMessage<OperatorCreateDeviceRequestMessageBody>;

export function createOperatorCreateDeviceRequestMessage(): OperatorCreateDeviceRequestMessage {
    const msg: OperatorCreateDeviceRequestMessage = {
        header: { type: OperatorRequestMessageType.createDeviceRequest },
        body: {} as OperatorCreateDeviceRequestMessageBody,
    };
    return msg;
};


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
};