import { OperatorNotificationMessageType } from './declarations/operator-message-type.mjs';
import { OperatorNotificationMessage } from './declarations/operator.message.mjs';

export interface OperatorConfigurationNotificationMessageBody {
    pingInterval: number;
}

export type OperatorConfigurationNotificationMessage = OperatorNotificationMessage<OperatorConfigurationNotificationMessageBody>;

export function createOperatorConfigurationNotificationMessage(): OperatorConfigurationNotificationMessage {
    const msg: OperatorConfigurationNotificationMessage = {
        header: { type: OperatorNotificationMessageType.configuration },
        body: {} as OperatorConfigurationNotificationMessageBody,
    };
    return msg;
};
