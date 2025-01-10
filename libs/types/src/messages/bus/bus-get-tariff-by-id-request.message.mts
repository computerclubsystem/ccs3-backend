import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetTariffByIdRequestMessageBody {
    tariffId: number;
}

export interface BusGetTariffByIdRequestMessage extends Message<BusGetTariffByIdRequestMessageBody> {
}

export function createBusGetTariffByIdRequestMessage(): BusGetTariffByIdRequestMessage {
    const msg: BusGetTariffByIdRequestMessage = {
        header: { type: MessageType.busGetTariffByIdRequest },
        body: {} as BusGetTariffByIdRequestMessageBody,
    };
    return msg;
};