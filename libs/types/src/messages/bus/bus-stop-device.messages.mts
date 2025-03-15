import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { DeviceStatus } from './bus-device-statuses-notification.message.mjs';

export interface BusStopDeviceRequestMessageBody {
    deviceId: number;
    userId?: number | null;
    stoppedByCustomer?: boolean | null;
    note?: string | null;
}

export type BusStopDeviceRequestMessage = Message<BusStopDeviceRequestMessageBody>;

export function createBusStopDeviceRequestMessage(): BusStopDeviceRequestMessage {
    const msg: BusStopDeviceRequestMessage = {
        header: { type: MessageType.busStopDeviceRequest },
        body: {} as BusStopDeviceRequestMessageBody,
    };
    return msg;
};


export interface BusStopDeviceReplyMessageBody {
    deviceStatus?: DeviceStatus | null;
}

export type BusStopDeviceReplyMessage = Message<BusStopDeviceReplyMessageBody>;

export function createBusStopDeviceReplyMessage(): BusStopDeviceReplyMessage {
    const msg: BusStopDeviceReplyMessage = {
        header: { type: MessageType.busStopDeviceReply },
        body: {} as BusStopDeviceReplyMessageBody,
    };
    return msg;
};
