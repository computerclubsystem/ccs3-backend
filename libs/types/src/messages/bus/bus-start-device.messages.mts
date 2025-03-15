import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { DeviceStatus } from './bus-device-statuses-notification.message.mjs';

export interface BusStartDeviceRequestMessageBody {
    deviceId: number;
    tariffId: number;
    userId: number;
}

export type BusStartDeviceRequestMessage = Message<BusStartDeviceRequestMessageBody>;

export function createBusStartDeviceRequestMessage(): BusStartDeviceRequestMessage {
    const msg: BusStartDeviceRequestMessage = {
        header: { type: MessageType.busStartDeviceRequest },
        body: {} as BusStartDeviceRequestMessageBody,
    };
    return msg;
};


export interface BusStartDeviceReplyMessageBody {
    deviceStatus?: DeviceStatus | null;
}

export type BusStartDeviceReplyMessage = Message<BusStartDeviceReplyMessageBody>;

export function createBusStartDeviceReplyMessage(): BusStartDeviceReplyMessage {
    const msg: BusStartDeviceReplyMessage = {
        header: { type: MessageType.busStartDeviceReply },
        body: {} as BusStartDeviceReplyMessageBody,
    };
    return msg;
};
