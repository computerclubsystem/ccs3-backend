import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorCreateTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
    deviceGroupIds?: number[] | null;
}

export type OperatorCreateTariffRequestMessage = OperatorRequestMessage<OperatorCreateTariffRequestMessageBody>;


export interface OperatorCreateTariffReplyMessageBody {
    tariff: Tariff;
}

export type OperatorCreateTariffReplyMessage = OperatorReplyMessage<OperatorCreateTariffReplyMessageBody>;

export function createOperatorCreateTariffReplyMessage(): OperatorCreateTariffReplyMessage {
    const msg: OperatorCreateTariffReplyMessage = {
        header: { type: OperatorReplyMessageType.createTariffReply },
        body: {} as OperatorCreateTariffReplyMessageBody,
    };
    return msg;
};

