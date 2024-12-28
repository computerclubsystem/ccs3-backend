import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorAuthRequestMessageBody {
    username?: string;
    passwordHash?: string;
    token?: string;
}

export interface OperatorAuthRequestMessage extends OperatorMessage<OperatorAuthRequestMessageBody> {
}
