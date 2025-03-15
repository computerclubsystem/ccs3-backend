import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusChangePrepaidTariffPasswordByCustomerRequestMessageBody {
    deviceId: number;
    currentPasswordHash: string;
    newPasswordHash: string;
}

export type BusChangePrepaidTariffPasswordByCustomerRequestMessage = Message<BusChangePrepaidTariffPasswordByCustomerRequestMessageBody>;

export function createBusChangePrepaidTariffPasswordByCustomerRequestMessage(): BusChangePrepaidTariffPasswordByCustomerRequestMessage {
    const msg: BusChangePrepaidTariffPasswordByCustomerRequestMessage = {
        header: { type: MessageType.busChangePrepaidTariffPasswordByCustomerRequest },
        body: {} as BusChangePrepaidTariffPasswordByCustomerRequestMessageBody,
    };
    return msg;
};


export type BusChangePrepaidTariffPasswordByCustomerReplyMessageBody = object;

export type BusChangePrepaidTariffPasswordByCustomerReplyMessage = Message<BusChangePrepaidTariffPasswordByCustomerReplyMessageBody>;

export function createBusChangePrepaidTariffPasswordByCustomerReplyMessage(): BusChangePrepaidTariffPasswordByCustomerReplyMessage {
    const msg: BusChangePrepaidTariffPasswordByCustomerReplyMessage = {
        header: { type: MessageType.busChangePrepaidTariffPasswordByCustomerReply },
        body: {},
    };
    return msg;
};
