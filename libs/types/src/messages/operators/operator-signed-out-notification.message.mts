import { OperatorNotificationMessageType } from './declarations/operator-message-type.mjs';
import { OperatorNotificationMessage } from './declarations/operator.message.mjs';

export type OperatorSignedOutNotificationMessageBody = object;

export type OperatorSignedOutNotificationMessage = OperatorNotificationMessage<OperatorSignedOutNotificationMessageBody>;

export function createOperatorSignedOutNotificationMessage(): OperatorSignedOutNotificationMessage {
    const msg: OperatorSignedOutNotificationMessage = {
        header: { type: OperatorNotificationMessageType.signedOutNotification, },
        body: {}
    };
    return msg;
}