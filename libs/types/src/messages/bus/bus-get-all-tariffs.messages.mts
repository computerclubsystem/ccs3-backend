import { Tariff, TariffType } from 'src/entities/tariff.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetAllTariffsRequestMessageBody {
    types?: TariffType[];
}

export type BusGetAllTariffsRequestMessage = Message<BusGetAllTariffsRequestMessageBody>;

export function createBusGetAllTariffsRequestMessage(): BusGetAllTariffsRequestMessage {
    const msg: BusGetAllTariffsRequestMessage = {
        header: { type: MessageType.busGetAllTariffsRequest },
        body: {} as BusGetAllTariffsRequestMessageBody,
    };
    return msg;
};


export interface BusGetAllTariffsReplyMessageBody {
    tariffs: Tariff[];
}

export type BusGetAllTariffsReplyMessage = Message<BusGetAllTariffsReplyMessageBody>;

export function createBusGetAllTariffsReplyMessage(): BusGetAllTariffsReplyMessage {
    const msg: BusGetAllTariffsReplyMessage = {
        header: { type: MessageType.busGetAllTariffsReply },
        body: {} as BusGetAllTariffsReplyMessageBody,
    };
    return msg;
};
