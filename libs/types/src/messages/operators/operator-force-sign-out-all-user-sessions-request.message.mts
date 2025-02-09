import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorForceSignOutAllUserSessionsRequestMessageBody {
    userId: number;
}

export interface OperatorForceSignOutAllUserSessionsRequestMessage extends OperatorRequestMessage<OperatorForceSignOutAllUserSessionsRequestMessageBody> {
}