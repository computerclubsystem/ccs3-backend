import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { DeviceStatus } from './bus-device-statuses.message.mjs';

export interface BusStopDeviceReplyMessageBody {
    deviceStatus?: DeviceStatus | null;
}

export interface BusStopDeviceReplyMessage extends Message<BusStopDeviceReplyMessageBody> {
}

export function createBusStopDeviceReplyMessage(): BusStopDeviceReplyMessage {
    const msg: BusStopDeviceReplyMessage = {
        header: { type: MessageType.busStopDeviceReply },
        body: {} as BusStopDeviceReplyMessageBody,
    };
    return msg;
};
