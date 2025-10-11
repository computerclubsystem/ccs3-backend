import { ServerToDeviceNotificationMessageType } from './declarations/server-to-device-notification-message-type.mjs';
import { ServerToDeviceNotificationMessage } from './declarations/server-to-device-notification-message.mjs';

export interface ServerToDeviceDeviceConfigurationNotificationMessageFeatureFlags {
    codeSignIn: boolean;
    secondPrice: boolean;
}

export interface ServerToDeviceDeviceConfigurationNotificationMessageBody {
    pingInterval: number;
    secondsAfterStoppedBeforeRestart?: number;
    secondsBeforeNotifyingCustomerForSessionEnd: number;
    sessionEndNotificationSoundFilePath?: string | null;
    featureFlags: ServerToDeviceDeviceConfigurationNotificationMessageFeatureFlags;
    secondPriceCurrency?: string | null;
}

export type ServerToDeviceDeviceConfigurationNotificationMessage = ServerToDeviceNotificationMessage<ServerToDeviceDeviceConfigurationNotificationMessageBody>;

export function createServerToDeviceDeviceConfigurationNotificationMessage(): ServerToDeviceDeviceConfigurationNotificationMessage {
    const msg: ServerToDeviceDeviceConfigurationNotificationMessage = {
        header: { type: ServerToDeviceNotificationMessageType.deviceConfiguration },
        body: {} as ServerToDeviceDeviceConfigurationNotificationMessageBody,
    };
    return msg;
};