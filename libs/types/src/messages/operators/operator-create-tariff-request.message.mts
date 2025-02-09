import { OperatorRequestMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorCreateTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
}

export interface OperatorCreateTariffRequestMessage extends OperatorRequestMessage<OperatorCreateTariffRequestMessageBody> {
}
