import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { User } from 'src/entities/user.mjs';

export interface OperatorCreateUserWithRolesRequestMessageBody {
    user: User;
    passwordHash: string;
    roleIds: number[];
}

export type OperatorCreateUserWithRolesRequestMessage = OperatorRequestMessage<OperatorCreateUserWithRolesRequestMessageBody>;


export interface OperatorCreateUserWithRolesReplyMessageBody {
    user?: User;
    roleIds?: number[];
}

export type OperatorCreateUserWithRolesReplyMessage = OperatorReplyMessage<OperatorCreateUserWithRolesReplyMessageBody>;

export function createOperatorCreateUserWithRolesReplyMessage(): OperatorCreateUserWithRolesReplyMessage {
    const msg: OperatorCreateUserWithRolesReplyMessage = {
        header: { type: OperatorReplyMessageType.createUserWithRolesReply },
        body: {} as OperatorCreateUserWithRolesReplyMessageBody,
    };
    return msg;
};

