import { Tariff } from 'src/entities/tariff.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusRechargeTariffDurationRequestMessageBody {
    tariffId: number;
    userId: number;
}

export type BusRechargeTariffDurationRequestMessage = Message<BusRechargeTariffDurationRequestMessageBody>;

export function createBusRechargeTariffDurationRequestMessage(): BusRechargeTariffDurationRequestMessage {
    const msg: BusRechargeTariffDurationRequestMessage = {
        header: { type: MessageType.busRechargeTariffDurationRequest },
        body: {} as BusRechargeTariffDurationRequestMessageBody,
    };
    return msg;
};


export interface BusRechargeTariffDurationReplyMessageBody {
    tariff: Tariff;
}

export type BusRechargeTariffDurationReplyMessage = Message<BusRechargeTariffDurationReplyMessageBody>;

export function createBusRechargeTariffDurationReplyMessage(): BusRechargeTariffDurationReplyMessage {
    const msg: BusRechargeTariffDurationReplyMessage = {
        header: { type: MessageType.busRechargeTariffDurationReply },
        body: {} as BusRechargeTariffDurationReplyMessageBody,
    };
    return msg;
};
