import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorSignOutRequestMessageBody {
    currentToken: string;
}

export interface OperatorSignOutRequestMessage extends OperatorMessage<OperatorSignOutRequestMessageBody> {
}
