import { ServerToDeviceNotificationMessageType } from './declarations/server-to-device-notification-message-type.mjs';
import { ServerToDeviceNotificationMessage } from './declarations/server-to-device-notification-message.mjs';

export type ServerToDeviceShutdownNoitificationMessageBody = object;

export type ServerToDeviceShutdownNoitificationMessage = ServerToDeviceNotificationMessage<ServerToDeviceShutdownNoitificationMessageBody>;

export function createServerToDeviceShutdownNoitificationMessage(): ServerToDeviceShutdownNoitificationMessage {
    const msg: ServerToDeviceShutdownNoitificationMessage = {
        header: { type: ServerToDeviceNotificationMessageType.shutdown },
        body: {},
    };
    return msg;
}
