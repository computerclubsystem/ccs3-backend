import { Device } from 'src/entities/device.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

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