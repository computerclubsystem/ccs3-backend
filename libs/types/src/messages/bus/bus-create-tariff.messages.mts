import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusCreateTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
    userId: number;
    deviceGroupIds?: number[] | null;
}

export type BusCreateTariffRequestMessage = Message<BusCreateTariffRequestMessageBody>;

export function createBusCreateTariffRequestMessage(): BusCreateTariffRequestMessage {
    const msg: BusCreateTariffRequestMessage = {
        header: { type: MessageType.busCreateTariffRequest },
        body: {} as BusCreateTariffRequestMessageBody,
    };
    return msg;
};


export interface BusCreateTariffReplyMessageBody {
    tariff?: Tariff;
}

export type BusCreateTariffReplyMessage = Message<BusCreateTariffReplyMessageBody>;

export function createBusCreateTariffReplyMessage(): BusCreateTariffReplyMessage {
    const msg: BusCreateTariffReplyMessage = {
        header: { type: MessageType.busCreateTariffReply },
        body: {} as BusCreateTariffReplyMessageBody,
    };
    return msg;
};
