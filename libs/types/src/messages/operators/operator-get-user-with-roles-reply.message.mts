import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { User } from 'src/entities/user.mjs';

export interface OperatorGetUserWithRolesReplyMessageBody {
    user?: User;
    roleIds?: number[];
}

export interface OperatorGetUserWithRolesReplyMessage extends OperatorReplyMessage<OperatorGetUserWithRolesReplyMessageBody> {
}

export function createOperatorGetUserWithRolesReplyMessage(): OperatorGetUserWithRolesReplyMessage {
    const msg: OperatorGetUserWithRolesReplyMessage = {
        header: { type: OperatorReplyMessageType.getUserWithRolesReply },
        body: {} as OperatorGetUserWithRolesReplyMessageBody,
    };
    return msg;
};
