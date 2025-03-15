import { Device } from 'src/entities/device.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusUpdateDeviceRequestMessageBody {
    device: Device;
}

export type BusUpdateDeviceRequestMessage = Message<BusUpdateDeviceRequestMessageBody>;

export function createBusUpdateDeviceRequestMessage(): BusUpdateDeviceRequestMessage {
    const msg: BusUpdateDeviceRequestMessage = {
        header: { type: MessageType.busUpdateDeviceRequest },
        body: {} as BusUpdateDeviceRequestMessageBody,
    };
    return msg;
};


export interface BusUpdateDeviceReplyMessageBody {
    device?: Device;
}

export type BusUpdateDeviceReplyMessage = Message<BusUpdateDeviceReplyMessageBody>;

export function createBusUpdateDeviceReplyMessage(): BusUpdateDeviceReplyMessage {
    const msg: BusUpdateDeviceReplyMessage = {
        header: { type: MessageType.busUpdateDeviceReply },
        body: {} as BusUpdateDeviceReplyMessageBody,
    };
    return msg;
};
