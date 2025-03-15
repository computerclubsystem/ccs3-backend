import { Tariff, TariffType } from 'src/entities/tariff.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorGetAllTariffsRequestMessageBody {
    types?: TariffType[];
}

export type OperatorGetAllTariffsRequestMessage = OperatorRequestMessage<OperatorGetAllTariffsRequestMessageBody>;


export interface OperatorGetAllTariffsReplyMessageBody {
    tariffs: Tariff[];
}

export type OperatorGetAllTariffsReplyMessage = OperatorReplyMessage<OperatorGetAllTariffsReplyMessageBody>;

export function createOperatorGetAllTariffsReplyMessage(): OperatorGetAllTariffsReplyMessage {
    const msg: OperatorGetAllTariffsReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllTariffsReply },
        body: {} as OperatorGetAllTariffsReplyMessageBody,
    };
    return msg;
};
