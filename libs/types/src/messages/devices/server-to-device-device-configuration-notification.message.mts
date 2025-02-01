import { ServerToDeviceNotificationMessageType } from './declarations/server-to-device-notification-message-type.mjs';
import { ServerToDeviceNotificationMessage } from './declarations/server-to-device-notification-message.mjs';

export interface ServerToDeviceDeviceConfigurationNotificationMessageBody {
    pingInterval: number;
    secondsAfterStoppedBeforeRestart?: number;
}

export interface ServerToDeviceDeviceConfigurationNotificationMessage extends ServerToDeviceNotificationMessage<ServerToDeviceDeviceConfigurationNotificationMessageBody> {
}

export function createServerToDeviceDeviceConfigurationNotificationMessage(): ServerToDeviceDeviceConfigurationNotificationMessage {
    const msg: ServerToDeviceDeviceConfigurationNotificationMessage = {
        header: { type: ServerToDeviceNotificationMessageType.deviceConfiguration },
        body: {} as ServerToDeviceDeviceConfigurationNotificationMessageBody,
    };
    return msg;
};