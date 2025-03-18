import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusUpdateTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
    userId: number;
    deviceGroupIds?: number[] | null;
}

export type BusUpdateTariffRequestMessage = Message<BusUpdateTariffRequestMessageBody>;

export function createBusUpdateTariffRequestMessage(): BusUpdateTariffRequestMessage {
    const msg: BusUpdateTariffRequestMessage = {
        header: { type: MessageType.busUpdateTariffRequest },
        body: {} as BusUpdateTariffRequestMessageBody,
    };
    return msg;
};


export interface BusUpdateTariffReplyMessageBody {
    tariff?: Tariff;
}

export type BusUpdateTariffReplyMessage = Message<BusUpdateTariffReplyMessageBody>;

export function createBusUpdateTariffReplyMessage(): BusUpdateTariffReplyMessage {
    const msg: BusUpdateTariffReplyMessage = {
        header: { type: MessageType.busUpdateTariffReply },
        body: {} as BusUpdateTariffReplyMessageBody,
    };
    return msg;
};
