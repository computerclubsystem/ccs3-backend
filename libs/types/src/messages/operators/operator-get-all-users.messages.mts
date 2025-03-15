import { User } from 'src/entities/user.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export type OperatorGetAllUsersRequestMessageBody = object;

export type OperatorGetAllUsersRequestMessage = OperatorRequestMessage<OperatorGetAllUsersRequestMessageBody>;


export interface OperatorGetAllUsersReplyMessageBody {
    users: User[];
}

export type OperatorGetAllUsersReplyMessage = OperatorReplyMessage<OperatorGetAllUsersReplyMessageBody>;

export function createOperatorGetAllUsersReplyMessage(): OperatorGetAllUsersReplyMessage {
    const msg: OperatorGetAllUsersReplyMessage = {
        header: { type: OperatorReplyMessageType.getAllUsersReply },
        body: {} as OperatorGetAllUsersReplyMessageBody,
    };
    return msg;
};

