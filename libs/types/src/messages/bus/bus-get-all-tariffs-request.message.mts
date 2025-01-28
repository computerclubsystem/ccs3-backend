import { TariffType } from 'src/entities/tariff.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetAllTariffsRequestMessageBody {
    types?: TariffType[];
}

export interface BusGetAllTariffsRequestMessage extends Message<BusGetAllTariffsRequestMessageBody> {
}

export function createBusGetAllTariffsRequestMessage(): BusGetAllTariffsRequestMessage {
    const msg: BusGetAllTariffsRequestMessage = {
        header: { type: MessageType.busGetAllTariffsRequest },
        body: {} as BusGetAllTariffsRequestMessageBody,
    };
    return msg;
};