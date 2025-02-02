import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';

export interface OperatorForceSignOutAllUserSessionsReplyMessageBody {
    sessionsCount: number;
    connectionsCount: number;
}

export interface OperatorForceSignOutAllUserSessionsReplyMessage extends OperatorReplyMessage<OperatorForceSignOutAllUserSessionsReplyMessageBody> {
}

export function createOperatorForceSignOutAllUserSessionsReplyMessage(): OperatorForceSignOutAllUserSessionsReplyMessage {
    var msg: OperatorForceSignOutAllUserSessionsReplyMessage = {
        header: {
            type: OperatorReplyMessageType.forceSignOutAllUserSessionsReply,
        },
        body: {} as OperatorForceSignOutAllUserSessionsReplyMessageBody,
    };
    return msg;
}