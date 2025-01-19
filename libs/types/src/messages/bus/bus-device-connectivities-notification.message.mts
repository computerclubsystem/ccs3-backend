import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusDeviceConnectivityItem {
    deviceId?: number | null;
    deviceName?: string | null;
    certificateThumbprint: string;
    connectionsCount: number;
    lastConnectionSince: number;
    messagesCount: number;
    lastMessageSince?: number | null;
    isConnected: boolean;
}

export interface BusDeviceConnectivitiesNotificationMessageBody {
    connectivityItems: BusDeviceConnectivityItem[];
}

export interface BusDeviceConnectivitiesNotificationMessage extends Message<BusDeviceConnectivitiesNotificationMessageBody> {
}

export function createBusDeviceConnectivitiesNotificationMessage(): BusDeviceConnectivitiesNotificationMessage {
    const msg: BusDeviceConnectivitiesNotificationMessage = {
        header: { type: MessageType.busDeviceConnectivitiesNotification },
        body: {} as BusDeviceConnectivitiesNotificationMessageBody,
    };
    return msg;
};