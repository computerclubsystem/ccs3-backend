import { OperatorNotificationMessageType } from './declarations/operator-message-type.mjs';
import { OperatorNotificationMessage } from './declarations/operator.message.mjs';

export interface OperatorPublicConfigurationNotificationFeatureFlags {
    codeSignIn: boolean;
}

export interface OperatorPublicConfigurationNotificationMessageBody {
    featureFlags: OperatorPublicConfigurationNotificationFeatureFlags;
    authenticationTimeoutSeconds: number;
    // TODO: Add more public info like copmany name, terms of service, system messages etc.
}

export type OperatorPublicConfigurationNotificationMessage = OperatorNotificationMessage<OperatorPublicConfigurationNotificationMessageBody>;

export function createOperatorPublicConfigurationNotificationMessage(): OperatorPublicConfigurationNotificationMessage {
    const msg: OperatorPublicConfigurationNotificationMessage = {
        header: {type: OperatorNotificationMessageType.publicConfigurationNotification},
        body: {} as OperatorPublicConfigurationNotificationMessageBody,
    };
    return msg;
}