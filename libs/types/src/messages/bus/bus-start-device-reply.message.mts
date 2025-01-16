import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { DeviceStatus } from './bus-device-statuses.message.mjs';

export interface BusStartDeviceReplyMessageBody {
    deviceStatus?: DeviceStatus | null;
}

export interface BusStartDeviceReplyMessage extends Message<BusStartDeviceReplyMessageBody> {
}

export function createBusStartDeviceReplyMessage<TBody>(sourceMessage?: Message<TBody> | null): BusStartDeviceReplyMessage {
    const msg: BusStartDeviceReplyMessage = {
        header: { type: MessageType.busStartDeviceReply },
        body: {} as BusStartDeviceReplyMessageBody,
    };
    return msg;
};
