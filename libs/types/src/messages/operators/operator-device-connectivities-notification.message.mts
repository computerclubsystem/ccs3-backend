import { OperatorNotificationMessageType } from './declarations/operator-message-type.mjs';
import { OperatorNotificationMessage } from './declarations/operator.message.mjs';

export interface OperatorDeviceConnectivityItem {
    deviceId?: number | null;
    isConnected: boolean;
}

export interface OperatorDeviceConnectivitiesNotificationMessageBody {
    connectivityItems: OperatorDeviceConnectivityItem[];
}

export type OperatorDeviceConnectivitiesNotificationMessage = OperatorNotificationMessage<OperatorDeviceConnectivitiesNotificationMessageBody>;

export function createOperatorDeviceConnectivitiesNotificationMessage(): OperatorDeviceConnectivitiesNotificationMessage {
    const msg: OperatorDeviceConnectivitiesNotificationMessage = {
        header: { type: OperatorNotificationMessageType.deviceConnectivitiesNotification },
        body: {} as OperatorDeviceConnectivitiesNotificationMessageBody,
    };
    return msg;
};