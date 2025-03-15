import { Tariff } from 'src/entities/tariff.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorGetTariffByIdRequestMessageBody {
    tariffId: number;
}

export type OperatorGetTariffByIdRequestMessage = OperatorRequestMessage<OperatorGetTariffByIdRequestMessageBody>;


export interface OperatorGetTariffByIdReplyMessageBody {
    tariff: Tariff;
}

export type OperatorGetTariffByIdReplyMessage = OperatorReplyMessage<OperatorGetTariffByIdReplyMessageBody>;

export function createOperatorGetTariffByIdReplyMessage(): OperatorGetTariffByIdReplyMessage {
    const msg: OperatorGetTariffByIdReplyMessage = {
        header: { type: OperatorReplyMessageType.getTariffByIdReply },
        body: {} as OperatorGetTariffByIdReplyMessageBody,
    };
    return msg;
};

