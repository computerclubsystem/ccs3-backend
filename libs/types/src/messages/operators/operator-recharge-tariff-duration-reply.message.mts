import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorRechargeTariffDurationReplyMessageBody {
    remainingSeconds?: number | null;
}

export interface OperatorRechargeTariffDurationReplyMessage extends OperatorReplyMessage<OperatorRechargeTariffDurationReplyMessageBody> {
}

export function createOperatorRechargeTariffDurationReplyMessage(): OperatorRechargeTariffDurationReplyMessage {
    const msg: OperatorRechargeTariffDurationReplyMessage = {
        header: { type: OperatorReplyMessageType.rechargeTariffDurationReply },
        body: {} as OperatorRechargeTariffDurationReplyMessageBody,
    };
    return msg;
};
