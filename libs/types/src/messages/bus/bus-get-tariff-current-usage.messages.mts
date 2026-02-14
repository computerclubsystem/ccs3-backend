import { DeviceWithTariff } from 'src/entities/device-with-tariff.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetTariffCurrentUsageRequestMessageBody {
    tariffId: number;
}

export type BusGetTariffCurrentUsageRequestMessage = Message<BusGetTariffCurrentUsageRequestMessageBody>;

export function createBusGetTariffCurrentUsageRequestMessage(): BusGetTariffCurrentUsageRequestMessage {
    const msg: BusGetTariffCurrentUsageRequestMessage = {
        header: { type: MessageType.busGetTariffCurrentUsageRequest },
        body: {} as BusGetTariffCurrentUsageRequestMessageBody,
    };
    return msg;
};


export interface BusGetTariffCurrentUsageReplyMessageBody {
    devicesWithTariffs: DeviceWithTariff[];
}

export type BusGetTariffCurrentUsageReplyMessage = Message<BusGetTariffCurrentUsageReplyMessageBody>;

export function createBusGetTariffCurrentUsageReplyMessage(): BusGetTariffCurrentUsageReplyMessage {
    const msg: BusGetTariffCurrentUsageReplyMessage = {
        header: { type: MessageType.busGetTariffCurrentUsageReply },
        body: {} as BusGetTariffCurrentUsageReplyMessageBody,
    };
    return msg;
};