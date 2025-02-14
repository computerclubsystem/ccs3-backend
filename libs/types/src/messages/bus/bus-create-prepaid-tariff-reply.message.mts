import { Message } from '../declarations/message.mjs';
import { transferSharedMessageData } from '../utils.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusCreatePrepaidTariffReplyMessageBody {
    tariff?: Tariff;
}

export interface BusCreatePrepaidTariffReplyMessage extends Message<BusCreatePrepaidTariffReplyMessageBody> {
}

export function createBusCreatePrepaidTariffReplyMessage(): BusCreatePrepaidTariffReplyMessage {
    const msg: BusCreatePrepaidTariffReplyMessage = {
        header: { type: MessageType.busCreatePrepaidTariffReply },
        body: {} as BusCreatePrepaidTariffReplyMessageBody,
    };
    return msg;
};
