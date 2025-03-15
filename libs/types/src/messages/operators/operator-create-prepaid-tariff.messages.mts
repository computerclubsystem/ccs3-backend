import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorCreatePrepaidTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
}

export type OperatorCreatePrepaidTariffRequestMessage = OperatorRequestMessage<OperatorCreatePrepaidTariffRequestMessageBody>;


export interface OperatorCreatePrepaidTariffReplyMessageBody {
    tariff: Tariff;
}

export type OperatorCreatePrepaidTariffReplyMessage = OperatorReplyMessage<OperatorCreatePrepaidTariffReplyMessageBody>;

export function createOperatorCreatePrepaidTariffReplyMessage(): OperatorCreatePrepaidTariffReplyMessage {
    const msg: OperatorCreatePrepaidTariffReplyMessage = {
        header: { type: OperatorReplyMessageType.createPrepaidTariffReply },
        body: {} as OperatorCreatePrepaidTariffReplyMessageBody,
    };
    return msg;
};

