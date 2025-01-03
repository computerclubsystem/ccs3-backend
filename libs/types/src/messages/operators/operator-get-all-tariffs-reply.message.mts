import { OperatorMessageType } from './declarations/operator-message-type.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorGetAllTariffsReplyMessageBody {
    tariffs: Tariff[];
}

export interface OperatorGetAllTariffsReplyMessage extends OperatorMessage<OperatorGetAllTariffsReplyMessageBody> {
}

export function createOperatorGetAllTariffsReplyMessage(): OperatorGetAllTariffsReplyMessage {
    const msg: OperatorGetAllTariffsReplyMessage = {
        header: { type: OperatorMessageType.getAllTariffsReply },
        body: {} as OperatorGetAllTariffsReplyMessageBody,
    };
    return msg;
};
