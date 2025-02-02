import { OperatorNotificationMessageType } from './declarations/operator-message-type.mjs';
import { OperatorNotificationMessage } from './declarations/operator.message.mjs';

export interface OperatorSignedOutNotificationMessageBody {
}

export interface OperatorSignedOutNotificationMessage extends OperatorNotificationMessage<OperatorSignedOutNotificationMessageBody> {
}

export function createOperatorSignedOutNotificationMessage(): OperatorSignedOutNotificationMessage {
    const msg: OperatorSignedOutNotificationMessage = {
        header: {
            type: OperatorNotificationMessageType.signedOutNotification,
        },
        body: {}
    };
    return msg;
}