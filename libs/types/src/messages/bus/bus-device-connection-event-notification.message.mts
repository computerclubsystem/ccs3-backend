import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { DeviceConnectionEventType } from '../../entities/declarations/device-connection-event-type.mjs';

export interface BusDeviceConnectionEventNotificationMessageBody {
    deviceId: number;
    ipAddress: string;
    type: DeviceConnectionEventType;
    note?: string;
}

export type BusDeviceConnectionEventNotificationMessage = Message<BusDeviceConnectionEventNotificationMessageBody>;

export function createBusDeviceConnectionEventNotificationMessage(): BusDeviceConnectionEventNotificationMessage {
    const msg: BusDeviceConnectionEventNotificationMessage = {
        header: { type: MessageType.busDeviceConnectionEventNotification },
        body: {} as BusDeviceConnectionEventNotificationMessageBody,
    };
    return msg;
};