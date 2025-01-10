import { OperatorMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorUpdateTariffRequestMessageBody {
    tariff: Tariff;
}

export interface OperatorUpdateTariffRequestMessage extends OperatorMessage<OperatorUpdateTariffRequestMessageBody> {
}
