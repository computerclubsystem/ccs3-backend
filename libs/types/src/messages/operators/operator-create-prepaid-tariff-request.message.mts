import { OperatorRequestMessage } from './declarations/operator.message.mjs';
import { Tariff } from 'src/entities/tariff.mjs';

export interface OperatorCreatePrepaidTariffRequestMessageBody {
    tariff: Tariff;
    passwordHash?: string;
}

export interface OperatorCreatePrepaidTariffRequestMessage extends OperatorRequestMessage<OperatorCreatePrepaidTariffRequestMessageBody> {
}
