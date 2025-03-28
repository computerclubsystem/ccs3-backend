import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorForceSignOutAllUserSessionsRequestMessageBody {
    userId: number;
}

export type OperatorForceSignOutAllUserSessionsRequestMessage = OperatorRequestMessage<OperatorForceSignOutAllUserSessionsRequestMessageBody>;


export interface OperatorForceSignOutAllUserSessionsReplyMessageBody {
    sessionsCount: number;
    connectionsCount: number;
}

export type OperatorForceSignOutAllUserSessionsReplyMessage = OperatorReplyMessage<OperatorForceSignOutAllUserSessionsReplyMessageBody>;

export function createOperatorForceSignOutAllUserSessionsReplyMessage(): OperatorForceSignOutAllUserSessionsReplyMessage {
    const msg: OperatorForceSignOutAllUserSessionsReplyMessage = {
        header: { type: OperatorReplyMessageType.forceSignOutAllUserSessionsReply, },
        body: {} as OperatorForceSignOutAllUserSessionsReplyMessageBody,
    };
    return msg;
};