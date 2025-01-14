import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { User } from 'src/entities/user.mjs';

export interface OperatorCreateUserWithRolesReplyMessageBody {
    user?: User;
    roleIds?: number[];
}

export interface OperatorCreateUserWithRolesReplyMessage extends OperatorReplyMessage<OperatorCreateUserWithRolesReplyMessageBody> {
}

export function createOperatorCreateUserWithRolesReplyMessage(): OperatorCreateUserWithRolesReplyMessage {
    const msg: OperatorCreateUserWithRolesReplyMessage = {
        header: { type: OperatorReplyMessageType.createUserWithRolesReply },
        body: {} as OperatorCreateUserWithRolesReplyMessageBody,
    };
    return msg;
};
