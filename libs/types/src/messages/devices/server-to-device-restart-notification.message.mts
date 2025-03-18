import { ServerToDeviceNotificationMessageType } from './declarations/server-to-device-notification-message-type.mjs';
import { ServerToDeviceNotificationMessage } from './declarations/server-to-device-notification-message.mjs';

export type ServerToDeviceRestartNoitificationMessageBody = object;

export type ServerToDeviceRestartNoitificationMessage = ServerToDeviceNotificationMessage<ServerToDeviceRestartNoitificationMessageBody>;

export function createServerToDeviceRestartNoitificationMessage(): ServerToDeviceRestartNoitificationMessage {
    const msg: ServerToDeviceRestartNoitificationMessage = {
        header: { type: ServerToDeviceNotificationMessageType.restart },
        body: {},
    };
    return msg;
}
