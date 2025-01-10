import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusUpdateTariffReplyMessageBody {
    tariff?: Tariff;
}

export interface BusUpdateTariffReplyMessage extends Message<BusUpdateTariffReplyMessageBody> {
}

export function createBusUpdateTariffReplyMessage(): BusUpdateTariffReplyMessage {
    const msg: BusUpdateTariffReplyMessage = {
        header: { type: MessageType.busUpdateTariffReply },
        body: {} as BusUpdateTariffReplyMessageBody,
    };
    return msg;
};
