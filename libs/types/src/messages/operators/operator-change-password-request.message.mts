import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorChangePasswordRequestMessageBody {
    currentPasswordHash: string;
    newPasswordHash: string;
}

export type OperatorChangePasswordRequestMessage = OperatorRequestMessage<OperatorChangePasswordRequestMessageBody>;