import { OperatorMessage } from './declarations/operator.message.mjs';
import { User } from 'src/entities/user.mjs';

export interface OperatorUpdateUserWithRolesRequestMessageBody {
    user: User;
    passwordHash?: string;
    roleIds: number[];
}

export interface OperatorUpdateUserWithRolesRequestMessage extends OperatorMessage<OperatorUpdateUserWithRolesRequestMessageBody> {
}
