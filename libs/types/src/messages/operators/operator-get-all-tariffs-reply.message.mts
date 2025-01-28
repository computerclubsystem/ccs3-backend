import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorGetAllTariffsReplyMessageBody {
    tariffs: Tariff[];
}

export interface OperatorGetAllTariffsReplyMessage extends OperatorReplyMessage<OperatorGetAllTariffsReplyMessageBody> {
}

export function createOperatorGetAllTariffsReplyMessage(): OperatorGetAllTariffsReplyMessage {
    const msg: OperatorGetAllTariffsReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllTariffsReply },
        body: {} as OperatorGetAllTariffsReplyMessageBody,
    };
    return msg;
};
