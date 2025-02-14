import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusCreatePrepaidTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
}

export interface BusCreatePrepaidTariffRequestMessage extends Message<BusCreatePrepaidTariffRequestMessageBody> {
}

export function createBusCreatePrepaidTariffRequestMessage(): BusCreatePrepaidTariffRequestMessage {
    const msg: BusCreatePrepaidTariffRequestMessage = {
        header: { type: MessageType.busCreatePrepaidTariffRequest },
        body: {} as BusCreatePrepaidTariffRequestMessageBody,
    };
    return msg;
};
