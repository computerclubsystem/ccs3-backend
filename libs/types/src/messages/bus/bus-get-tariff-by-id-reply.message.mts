import { Message } from '../declarations/message.mjs';
import { transferSharedMessageData } from '../utils.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusGetTariffByIdReplyMessageBody {
    tariff?: Tariff;
}

export interface BusGetTariffByIdReplyMessage extends Message<BusGetTariffByIdReplyMessageBody> {
}

export function createBusGetTariffByIdReplyMessage<TBody>(sourceMessage?: Message<TBody> | null): BusGetTariffByIdReplyMessage {
    const msg: BusGetTariffByIdReplyMessage = {
        header: { type: MessageType.busGetTariffByIdReply },
        body: {} as BusGetTariffByIdReplyMessageBody,
    };
    transferSharedMessageData(msg, sourceMessage);
    return msg;
};
