import { User } from 'src/entities/user.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorGetAllUsersReplyMessageBody {
    users: User[];
}

export interface OperatorGetAllUsersReplyMessage extends OperatorReplyMessage<OperatorGetAllUsersReplyMessageBody> {
}

export function createOperatorGetAllUsersReplyMessage(): OperatorGetAllUsersReplyMessage {
    const msg: OperatorGetAllUsersReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllUsersReply },
        body: {} as OperatorGetAllUsersReplyMessageBody,
    };
    return msg;
};
