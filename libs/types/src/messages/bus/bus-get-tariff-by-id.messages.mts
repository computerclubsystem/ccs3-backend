import { Tariff } from 'src/entities/tariff.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetTariffByIdRequestMessageBody {
    tariffId: number;
}

export type BusGetTariffByIdRequestMessage = Message<BusGetTariffByIdRequestMessageBody>;

export function createBusGetTariffByIdRequestMessage(): BusGetTariffByIdRequestMessage {
    const msg: BusGetTariffByIdRequestMessage = {
        header: { type: MessageType.busGetTariffByIdRequest },
        body: {} as BusGetTariffByIdRequestMessageBody,
    };
    return msg;
};


export interface BusGetTariffByIdReplyMessageBody {
    tariff?: Tariff;
}

export type BusGetTariffByIdReplyMessage = Message<BusGetTariffByIdReplyMessageBody>;

export function createBusGetTariffByIdReplyMessage(): BusGetTariffByIdReplyMessage {
    const msg: BusGetTariffByIdReplyMessage = {
        header: { type: MessageType.busGetTariffByIdReply },
        body: {} as BusGetTariffByIdReplyMessageBody,
    };
    return msg;
};
