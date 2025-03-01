import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusUpdateTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
    userId: number;
}

export interface BusUpdateTariffRequestMessage extends Message<BusUpdateTariffRequestMessageBody> {
}

export function createBusUpdateTariffRequestMessage(): BusUpdateTariffRequestMessage {
    const msg: BusUpdateTariffRequestMessage = {
        header: { type: MessageType.busUpdateTariffRequest },
        body: {} as BusUpdateTariffRequestMessageBody,
    };
    return msg;
};