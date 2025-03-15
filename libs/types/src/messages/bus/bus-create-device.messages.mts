import { Device } from 'src/entities/device.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusCreateDeviceRequestMessageBody {
    device: Device;
}

export type BusCreateDeviceRequestMessage = Message<BusCreateDeviceRequestMessageBody>;

export function createBusCreateDeviceRequestMessage(): BusCreateDeviceRequestMessage {
    const msg: BusCreateDeviceRequestMessage = {
        header: { type: MessageType.busCreateDeviceRequest },
        body: {} as BusCreateDeviceRequestMessageBody,
    };
    return msg;
}


export interface BusCreateDeviceReplyMessageBody {
    device: Device;
}

export type BusCreateDeviceReplyMessage = Message<BusCreateDeviceReplyMessageBody>;

export function createBusCreateDeviceReplyMessage(): BusCreateDeviceReplyMessage {
    const msg: BusCreateDeviceReplyMessage = {
        header: { type: MessageType.busCreateDeviceReply },
        body: {} as BusCreateDeviceReplyMessageBody,
    };
    return msg;
}