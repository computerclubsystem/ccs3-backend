import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusEndDeviceSessionByCustomerReplyMessageBody {
}

export interface BusEndDeviceSessionByCustomerReplyMessage extends Message<BusEndDeviceSessionByCustomerReplyMessageBody> {
}

export function createBusEndDeviceSessionByCustomerReplyMessage(): BusEndDeviceSessionByCustomerReplyMessage {
    const msg: BusEndDeviceSessionByCustomerReplyMessage = {
        header: { type: MessageType.busEndDeviceSessionByCustomerReply },
        body: {} as BusEndDeviceSessionByCustomerReplyMessageBody,
    };
    return msg;
};