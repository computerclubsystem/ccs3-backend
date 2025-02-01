import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusChangePrepaidTariffPasswordByCustomerReplyMessageBody {
}

export interface BusChangePrepaidTariffPasswordByCustomerReplyMessage extends Message<BusChangePrepaidTariffPasswordByCustomerReplyMessageBody> {
}

export function createBusChangePrepaidTariffPasswordByCustomerReplyMessage(): BusChangePrepaidTariffPasswordByCustomerReplyMessage {
    const msg: BusChangePrepaidTariffPasswordByCustomerReplyMessage = {
        header: { type: MessageType.busChangePrepaidTariffPasswordByCustomerReply },
        body: {} as BusChangePrepaidTariffPasswordByCustomerReplyMessageBody,
    };
    return msg;
};
