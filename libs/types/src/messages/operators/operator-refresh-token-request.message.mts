import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorRefreshTokenRequestMessageBody {
    currentToken: string;
}

export interface OperatorRefreshTokenRequestMessage extends OperatorMessage<OperatorRefreshTokenRequestMessageBody> {
}
