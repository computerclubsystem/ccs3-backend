import { TariffType } from 'src/entities/tariff.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorGetAllTariffsRequestMessageBody {
    types?: TariffType[];
}

export interface OperatorGetAllTariffsRequestMessage extends OperatorMessage<OperatorGetAllTariffsRequestMessageBody> {
}
