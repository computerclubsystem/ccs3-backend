import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface BusRechargeTariffDurationReplyMessageBody {
    tariff: Tariff;
}

export interface BusRechargeTariffDurationReplyMessage extends Message<BusRechargeTariffDurationReplyMessageBody> {
}

export function createBusRechargeTariffDurationReplyMessage(): BusRechargeTariffDurationReplyMessage {
    const msg: BusRechargeTariffDurationReplyMessage = {
        header: { type: MessageType.busRechargeTariffDurationReply },
        body: {} as BusRechargeTariffDurationReplyMessageBody,
    };
    return msg;
};
