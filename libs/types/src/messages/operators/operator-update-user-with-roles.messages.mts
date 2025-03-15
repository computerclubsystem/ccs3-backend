import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { User } from 'src/entities/user.mjs';

export interface OperatorUpdateUserWithRolesRequestMessageBody {
    user: User;
    passwordHash?: string;
    roleIds: number[];
}

export type OperatorUpdateUserWithRolesRequestMessage = OperatorRequestMessage<OperatorUpdateUserWithRolesRequestMessageBody>;


export interface OperatorUpdateUserWithRolesReplyMessageBody {
    user?: User;
    roleIds?: number[];
}

export type OperatorUpdateUserWithRolesReplyMessage = OperatorReplyMessage<OperatorUpdateUserWithRolesReplyMessageBody>;

export function createOperatorUpdateUserWithRolesReplyMessage(): OperatorUpdateUserWithRolesReplyMessage {
    const msg: OperatorUpdateUserWithRolesReplyMessage = {
        header: { type: OperatorReplyMessageType.updateUserWithRolesReply },
        body: {} as OperatorUpdateUserWithRolesReplyMessageBody,
    };
    return msg;
};

