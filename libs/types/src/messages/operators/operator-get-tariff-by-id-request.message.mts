import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetTariffByIdRequestMessageBody {
    tariffId: number;
}

export interface OperatorGetTariffByIdRequestMessage extends OperatorRequestMessage<OperatorGetTariffByIdRequestMessageBody> {
}
