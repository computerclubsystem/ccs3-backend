import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { User } from 'src/entities/user.mjs';

export interface OperatorUpdateUserWithRolesReplyMessageBody {
    user?: User;
    roleIds?: number[];
}

export interface OperatorUpdateUserWithRolesReplyMessage extends OperatorReplyMessage<OperatorUpdateUserWithRolesReplyMessageBody> {
}

export function createOperatorUpdateUserWithRolesReplyMessage(): OperatorUpdateUserWithRolesReplyMessage {
    const msg: OperatorUpdateUserWithRolesReplyMessage = {
        header: { type: OperatorReplyMessageType.updateUserWithRolesReply },
        body: {} as OperatorUpdateUserWithRolesReplyMessageBody,
    };
    return msg;
};
