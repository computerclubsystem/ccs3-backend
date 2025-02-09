import { OperatorRequestMessage } from './declarations/operator.message.mjs';
import { User } from 'src/entities/user.mjs';

export interface OperatorCreateUserWithRolesRequestMessageBody {
    user: User;
    passwordHash: string;
    roleIds: number[];
}

export interface OperatorCreateUserWithRolesRequestMessage extends OperatorRequestMessage<OperatorCreateUserWithRolesRequestMessageBody> {
}
