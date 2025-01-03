import { OperatorMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorCreateTariffRequestMessageBody {
    tariff: Tariff;
}

export interface OperatorCreateTariffRequestMessage extends OperatorMessage<OperatorCreateTariffRequestMessageBody> {
}
