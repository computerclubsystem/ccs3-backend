import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusStopDeviceRequestMessageBody {
    deviceId: number;
    userId?: number | null;
    stoppedByCustomer?: boolean | null;
    note?: string | null;
}

export interface BusStopDeviceRequestMessage extends Message<BusStopDeviceRequestMessageBody> {
}

export function createBusStopDeviceRequestMessage(): BusStopDeviceRequestMessage {
    const msg: BusStopDeviceRequestMessage = {
        header: { type: MessageType.busStopDeviceRequest },
        body: {} as BusStopDeviceRequestMessageBody,
    };
    return msg;
};