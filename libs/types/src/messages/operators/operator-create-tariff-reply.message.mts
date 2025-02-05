import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorCreateTariffReplyMessageBody {
    tariff: Tariff;
}

export interface OperatorCreateTariffReplyMessage extends OperatorReplyMessage<OperatorCreateTariffReplyMessageBody> {
}

export function createOperatorCreateTariffReplyMessage(): OperatorCreateTariffReplyMessage {
    const msg: OperatorCreateTariffReplyMessage = {
        header: { type: OperatorReplyMessageType.createTariffReply },
        body: {} as OperatorCreateTariffReplyMessageBody,
    };
    return msg;
};
