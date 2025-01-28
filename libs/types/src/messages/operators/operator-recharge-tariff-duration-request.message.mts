import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorRechargeTariffDurationRequestMessageBody {
    tariffId: number;
}

export interface OperatorRechargeTariffDurationRequestMessage extends OperatorMessage<OperatorRechargeTariffDurationRequestMessageBody> {
}
