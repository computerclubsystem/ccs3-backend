import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorUpdateTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
}

export type OperatorUpdateTariffRequestMessage = OperatorRequestMessage<OperatorUpdateTariffRequestMessageBody>;


export interface OperatorUpdateTariffReplyMessageBody {
    tariff?: Tariff;
}

export type OperatorUpdateTariffReplyMessage = OperatorReplyMessage<OperatorUpdateTariffReplyMessageBody>;

export function createOperatorUpdateTariffReplyMessage(): OperatorUpdateTariffReplyMessage {
    const msg: OperatorUpdateTariffReplyMessage = {
        header: { type: OperatorReplyMessageType.updateTariffReply },
        body: {} as OperatorUpdateTariffReplyMessageBody,
    };
    return msg;
};

