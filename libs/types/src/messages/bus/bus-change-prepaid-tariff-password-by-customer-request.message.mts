import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusChangePrepaidTariffPasswordByCustomerRequestMessageBody {
    deviceId: number;
    currentPasswordHash: string;
    newPasswordHash: string;
}

export interface BusChangePrepaidTariffPasswordByCustomerRequestMessage extends Message<BusChangePrepaidTariffPasswordByCustomerRequestMessageBody> {
}

export function createBusChangePrepaidTariffPasswordByCustomerRequestMessage(): BusChangePrepaidTariffPasswordByCustomerRequestMessage {
    const msg: BusChangePrepaidTariffPasswordByCustomerRequestMessage = {
        header: { type: MessageType.busChangePrepaidTariffPasswordByCustomerRequest },
        body: {} as BusChangePrepaidTariffPasswordByCustomerRequestMessageBody,
    };
    return msg;
};
