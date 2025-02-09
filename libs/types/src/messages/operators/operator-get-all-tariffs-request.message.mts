import { TariffType } from 'src/entities/tariff.mjs';
import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetAllTariffsRequestMessageBody {
    types?: TariffType[];
}

export interface OperatorGetAllTariffsRequestMessage extends OperatorRequestMessage<OperatorGetAllTariffsRequestMessageBody> {
}
