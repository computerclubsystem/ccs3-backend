import { DeviceWithTariff } from 'src/entities/device-with-tariff.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetTariffCurrentUsageRequestMessageBody {
    tariffId: number;
}

export type OperatorGetTariffCurrentUsageRequestMessage = OperatorRequestMessage<OperatorGetTariffCurrentUsageRequestMessageBody>;


export interface OperatorGetTariffCurrentUsageReplyMessageBody {
    devicesWithTariffs: DeviceWithTariff[];
}

export type OperatorGetTariffCurrentUsageReplyMessage = OperatorReplyMessage<OperatorGetTariffCurrentUsageReplyMessageBody>;

export function createOperatorGetTariffCurrentUsageReplyMessage(): OperatorGetTariffCurrentUsageReplyMessage {
    const msg: OperatorGetTariffCurrentUsageReplyMessage = {
        header: { type: OperatorReplyMessageType.getTariffCurrentUsageReply },
        body: {} as OperatorGetTariffCurrentUsageReplyMessageBody,
    };
    return msg;
};