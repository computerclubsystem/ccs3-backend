import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorGetUserWithRolesRequestMessageBody {
    userId: number;
}

export interface OperatorGetUserWithRolesRequestMessage extends OperatorMessage<OperatorGetUserWithRolesRequestMessageBody> {
}
