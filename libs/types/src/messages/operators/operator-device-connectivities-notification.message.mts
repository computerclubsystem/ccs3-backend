import { OperatorNotificationMessageType } from './declarations/operator-message-type.mjs';
import { OperatorNotificationMessage } from './declarations/operator.message.mjs';

export interface OperatorDeviceConnectivityItem {
    deviceId?: number | null;
    deviceName?: string | null;
    certificateThumbprint: string;
    connectionsCount: number;
    lastConnectionSince: number;
    messagesCount: number;
    lastMessageSince?: number | null;
    isConnected: boolean;
}

export interface OperatorDeviceConnectivitiesNotificationMessageBody {
    connectivityItems: OperatorDeviceConnectivityItem[];
}

export interface OperatorDeviceConnectivitiesNotificationMessage extends OperatorNotificationMessage<OperatorDeviceConnectivitiesNotificationMessageBody> {
}

export function createOperatorDeviceConnectivitiesNotificationMessage(): OperatorDeviceConnectivitiesNotificationMessage {
    const msg: OperatorDeviceConnectivitiesNotificationMessage = {
        header: { type: OperatorNotificationMessageType.deviceConnectivitiesNotification },
        body: {} as OperatorDeviceConnectivitiesNotificationMessageBody,
    };
    return msg;
};