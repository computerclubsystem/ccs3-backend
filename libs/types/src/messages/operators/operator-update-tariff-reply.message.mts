import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorUpdateTariffReplyMessageBody {
    tariff?: Tariff;
}

export interface OperatorUpdateTariffReplyMessage extends OperatorReplyMessage<OperatorUpdateTariffReplyMessageBody> {
}

export function createOperatorUpdateTariffReplyMessage(): OperatorUpdateTariffReplyMessage {
    const msg: OperatorUpdateTariffReplyMessage = {
        header: { type: OperatorReplyMessageType.updateTariffReply },
        body: {} as OperatorUpdateTariffReplyMessageBody,
    };
    return msg;
};
