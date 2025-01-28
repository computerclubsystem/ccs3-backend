import { OperatorMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorUpdateTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
}

export interface OperatorUpdateTariffRequestMessage extends OperatorMessage<OperatorUpdateTariffRequestMessageBody> {
}
