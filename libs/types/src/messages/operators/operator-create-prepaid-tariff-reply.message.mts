import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorCreatePrepaidTariffReplyMessageBody {
    tariff: Tariff;
}

export interface OperatorCreatePrepaidTariffReplyMessage extends OperatorReplyMessage<OperatorCreatePrepaidTariffReplyMessageBody> {
}

export function createOperatorCreatePrepaidTariffReplyMessage(): OperatorCreatePrepaidTariffReplyMessage {
    const msg: OperatorCreatePrepaidTariffReplyMessage = {
        header: { type: OperatorReplyMessageType.createPrepaidTariffReply },
        body: {} as OperatorCreatePrepaidTariffReplyMessageBody,
    };
    return msg;
};
