import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorForceSignOutAllUserSessionsRequestMessageBody {
    userId: number;
}

export interface OperatorForceSignOutAllUserSessionsRequestMessage extends OperatorMessage<OperatorForceSignOutAllUserSessionsRequestMessageBody> {
}