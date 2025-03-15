import { OperatorDeviceStatus } from 'src/entities/operator-device-status.mjs';
import { OperatorNotificationMessageType } from './declarations/operator-message-type.mjs';
import { OperatorNotificationMessage } from './declarations/operator.message.mjs';

export interface OperatorDeviceStatusesNotificationMessageBody {
    deviceStatuses: OperatorDeviceStatus[];
}

export type OperatorDeviceStatusesNotificationMessage = OperatorNotificationMessage<OperatorDeviceStatusesNotificationMessageBody>;

export function createOperatorDeviceStatusesNotificationMessage(): OperatorDeviceStatusesNotificationMessage {
    const msg: OperatorDeviceStatusesNotificationMessage = {
        header: { type: OperatorNotificationMessageType.deviceStatusesNotification },
        body: {} as OperatorDeviceStatusesNotificationMessageBody,
    };
    return msg;
};
