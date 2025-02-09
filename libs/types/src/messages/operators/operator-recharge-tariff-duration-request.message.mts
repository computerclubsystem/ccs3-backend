import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorRechargeTariffDurationRequestMessageBody {
    tariffId: number;
}

export interface OperatorRechargeTariffDurationRequestMessage extends OperatorRequestMessage<OperatorRechargeTariffDurationRequestMessageBody> {
}
