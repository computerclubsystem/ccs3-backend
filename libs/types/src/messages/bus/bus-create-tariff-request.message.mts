import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusCreateTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
}

export interface BusCreateTariffRequestMessage extends Message<BusCreateTariffRequestMessageBody> {
}

export function createBusCreateTariffRequestMessage(): BusCreateTariffRequestMessage {
    const msg: BusCreateTariffRequestMessage = {
        header: { type: MessageType.busCreateTariffRequest },
        body: {} as BusCreateTariffRequestMessageBody,
    };
    return msg;
};
