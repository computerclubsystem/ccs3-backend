import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusDeviceGetByIdRequestMessageBody {
    deviceId: number;
}

export interface BusDeviceGetByIdRequestMessage extends Message<BusDeviceGetByIdRequestMessageBody> {
}

export function createBusDeviceGetByIdRequestMessage(): BusDeviceGetByIdRequestMessage {
    const msg: BusDeviceGetByIdRequestMessage = {
        header: { type: MessageType.busOperatorGetDeviceByIdRequest },
        body: {} as BusDeviceGetByIdRequestMessageBody,
    };
    return msg;
};