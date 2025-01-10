import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorGetTariffByIdReplyMessageBody {
    tariff: Tariff;
}

export interface OperatorGetTariffByIdReplyMessage extends OperatorReplyMessage<OperatorGetTariffByIdReplyMessageBody> {
}

export function createOperatorGetTariffByIdReplyMessage(): OperatorGetTariffByIdReplyMessage {
    const msg: OperatorGetTariffByIdReplyMessage = {
        header: { type: OperatorReplyMessageType.getTariffByIdReply },
        body: {} as OperatorGetTariffByIdReplyMessageBody,
    };
    return msg;
};
