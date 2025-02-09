import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetUserWithRolesRequestMessageBody {
    userId: number;
}

export interface OperatorGetUserWithRolesRequestMessage extends OperatorRequestMessage<OperatorGetUserWithRolesRequestMessageBody> {
}
