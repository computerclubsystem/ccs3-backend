import { Device } from 'src/entities/device.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusGetAllDevicesRequestMessageBody = object;

export type BusGetAllDevicesRequestMessage = Message<BusGetAllDevicesRequestMessageBody>;

export function createBusGetAllDevicesRequestMessage(): BusGetAllDevicesRequestMessage {
    const msg: BusGetAllDevicesRequestMessage = {
        header: { type: MessageType.busGetAllDevicesRequest },
        body: {} as BusGetAllDevicesRequestMessageBody,
    };
    return msg;
};


export interface BusOperatorGetAllDevicesReplyMessageBody {
    devices: Device[];
}

export type BusOperatorGetAllDevicesReplyMessage = Message<BusOperatorGetAllDevicesReplyMessageBody>;

export function createBusOperatorGetAllDevicesReplyMessage(): BusOperatorGetAllDevicesReplyMessage {
    const msg: BusOperatorGetAllDevicesReplyMessage = {
        header: { type: MessageType.busGetAllDevicesReply },
        body: {} as BusOperatorGetAllDevicesReplyMessageBody,
    };
    return msg;
};
