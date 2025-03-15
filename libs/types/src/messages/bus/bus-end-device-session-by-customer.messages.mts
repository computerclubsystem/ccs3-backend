import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusEndDeviceSessionByCustomerRequestMessageBody {
    deviceId: number;
}

export type BusEndDeviceSessionByCustomerRequestMessage = Message<BusEndDeviceSessionByCustomerRequestMessageBody>;

export function createBusEndDeviceSessionByCustomerRequestMessage(): BusEndDeviceSessionByCustomerRequestMessage {
    var msg: BusEndDeviceSessionByCustomerRequestMessage = {
        header: {
            type: MessageType.busEndDeviceSessionByCustomerRequest,
        },
        body: {} as BusEndDeviceSessionByCustomerRequestMessageBody,
    };
    return msg;
}


export type BusEndDeviceSessionByCustomerReplyMessageBody = object;

export type BusEndDeviceSessionByCustomerReplyMessage = Message<BusEndDeviceSessionByCustomerReplyMessageBody>;

export function createBusEndDeviceSessionByCustomerReplyMessage(): BusEndDeviceSessionByCustomerReplyMessage {
    const msg: BusEndDeviceSessionByCustomerReplyMessage = {
        header: { type: MessageType.busEndDeviceSessionByCustomerReply },
        body: {},
    };
    return msg;
};