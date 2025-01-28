import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusRechargeTariffDurationRequestMessageBody {
    tariffId: number;
    userId: number;
}

export interface BusRechargeTariffDurationRequestMessage extends Message<BusRechargeTariffDurationRequestMessageBody> {
}

export function createBusRechargeTariffDurationRequestMessage(): BusRechargeTariffDurationRequestMessage {
    const msg: BusRechargeTariffDurationRequestMessage = {
        header: { type: MessageType.busRechargeTariffDurationRequest },
        body: {} as BusRechargeTariffDurationRequestMessageBody,
    };
    return msg;
};