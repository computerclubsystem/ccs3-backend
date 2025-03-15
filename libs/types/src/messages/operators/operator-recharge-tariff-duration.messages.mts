import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorRechargeTariffDurationRequestMessageBody {
    tariffId: number;
}

export type OperatorRechargeTariffDurationRequestMessage = OperatorRequestMessage<OperatorRechargeTariffDurationRequestMessageBody>;


export interface OperatorRechargeTariffDurationReplyMessageBody {
    remainingSeconds?: number | null;
}

export type OperatorRechargeTariffDurationReplyMessage = OperatorReplyMessage<OperatorRechargeTariffDurationReplyMessageBody>;

export function createOperatorRechargeTariffDurationReplyMessage(): OperatorRechargeTariffDurationReplyMessage {
    const msg: OperatorRechargeTariffDurationReplyMessage = {
        header: { type: OperatorReplyMessageType.rechargeTariffDurationReply },
        body: {} as OperatorRechargeTariffDurationReplyMessageBody,
    };
    return msg;
};

