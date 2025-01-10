import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusStartDeviceRequestMessageBody {
    deviceId: number;
    tariffId: number;
    userId: number;
}

export interface BusStartDeviceRequestMessage extends Message<BusStartDeviceRequestMessageBody> {
}

export function createBusStartDeviceRequestMessage(): BusStartDeviceRequestMessage {
    const msg: BusStartDeviceRequestMessage = {
        header: { type: MessageType.busStartDeviceRequest },
        body: {} as BusStartDeviceRequestMessageBody,
    };
    return msg;
};