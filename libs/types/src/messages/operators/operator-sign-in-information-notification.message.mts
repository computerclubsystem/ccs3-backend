import { OperatorNotificationMessageType } from './declarations/operator-message-type.mjs';
import { OperatorNotificationMessage } from './declarations/operator.message.mjs';

export interface OperatorSignInInformationNotificationMessageBody {
    lastShiftCompletedAt?: string | null;
    lastShiftCompletedByUsername?: string | null;
}

export type OperatorSignInInformationNotificationMessage = OperatorNotificationMessage<OperatorSignInInformationNotificationMessageBody>;

export function createOperatorSignInInformationNotificationMessage(): OperatorSignInInformationNotificationMessage {
    const msg: OperatorSignInInformationNotificationMessage = {
        header: {type: OperatorNotificationMessageType.signInInformationNotification},
        body: {} as OperatorSignInInformationNotificationMessageBody,
    };
    return msg;
}