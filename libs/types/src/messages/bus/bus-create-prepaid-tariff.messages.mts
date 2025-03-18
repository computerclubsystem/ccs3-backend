import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusCreatePrepaidTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
    userId: number;
    deviceGroupIds?: number[] | null;
}

export type BusCreatePrepaidTariffRequestMessage = Message<BusCreatePrepaidTariffRequestMessageBody>;

export function createBusCreatePrepaidTariffRequestMessage(): BusCreatePrepaidTariffRequestMessage {
    const msg: BusCreatePrepaidTariffRequestMessage = {
        header: { type: MessageType.busCreatePrepaidTariffRequest },
        body: {} as BusCreatePrepaidTariffRequestMessageBody,
    };
    return msg;
};


export interface BusCreatePrepaidTariffReplyMessageBody {
    tariff?: Tariff;
}

export type BusCreatePrepaidTariffReplyMessage = Message<BusCreatePrepaidTariffReplyMessageBody>;

export function createBusCreatePrepaidTariffReplyMessage(): BusCreatePrepaidTariffReplyMessage {
    const msg: BusCreatePrepaidTariffReplyMessage = {
        header: { type: MessageType.busCreatePrepaidTariffReply },
        body: {} as BusCreatePrepaidTariffReplyMessageBody,
    };
    return msg;
};
