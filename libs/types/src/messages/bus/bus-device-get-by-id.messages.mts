import { Device } from 'src/entities/device.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusDeviceGetByIdRequestMessageBody {
    deviceId: number;
}

export type BusDeviceGetByIdRequestMessage = Message<BusDeviceGetByIdRequestMessageBody>;

export function createBusDeviceGetByIdRequestMessage(): BusDeviceGetByIdRequestMessage {
    const msg: BusDeviceGetByIdRequestMessage = {
        header: { type: MessageType.busGetDeviceByIdRequest },
        body: {} as BusDeviceGetByIdRequestMessageBody,
    };
    return msg;
};

export interface BusDeviceGetByIdReplyMessageBody {
    device: Device;
}

export type BusDeviceGetByIdReplyMessage = Message<BusDeviceGetByIdReplyMessageBody>;

export function createBusDeviceGetByIdReplyMessage(): BusDeviceGetByIdReplyMessage {
    const msg: BusDeviceGetByIdReplyMessage = {
        header: { type: MessageType.busGetDeviceByIdReply },
        body: {} as BusDeviceGetByIdReplyMessageBody,
    };
    return msg;
};
