import { Message } from '../declarations/message.mjs';
import { transferSharedMessageData } from '../utils.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusCreateTariffReplyMessageBody {
    tariff?: Tariff;
}

export interface BusCreateTariffReplyMessage extends Message<BusCreateTariffReplyMessageBody> {
}

export function createBusCreateTariffReplyMessage<TBody>(sourceMessage?: Message<TBody> | null): BusCreateTariffReplyMessage {
    const msg: BusCreateTariffReplyMessage = {
        header: { type: MessageType.busCreateTariffReply },
        body: {} as BusCreateTariffReplyMessageBody,
    };
    transferSharedMessageData(msg, sourceMessage);
    return msg;
};
