import { TariffShortInfo } from 'src/entities/tariff.mjs';
import { ServerToDeviceNotificationMessageType } from './declarations/server-to-device-notification-message-type.mjs';
import { ServerToDeviceNotificationMessage } from './declarations/server-to-device-notification-message.mjs';

export interface DeviceStatusAmounts {
    totalSum?: number | null;
    totalTime?: number | null;
    startedAt?: number | null;
    stoppedAt?: number | null;
    expectedEndAt?: number | null;
    remainingSeconds?: number | null;
}

export interface ServerToDeviceCurrentStatusNotificationMessageBody {
    started: boolean;
    tariffId?: number | null;
    canBeStoppedByCustomer?: boolean | null;
    amounts: DeviceStatusAmounts;
    continuationTariffShortInfo?: TariffShortInfo | null;
}

export type ServerToDeviceCurrentStatusNotificationMessageMessage = ServerToDeviceNotificationMessage<ServerToDeviceCurrentStatusNotificationMessageBody>;

export function createServerToDeviceCurrentStatusNotificationMessageMessage(): ServerToDeviceCurrentStatusNotificationMessageMessage {
    const msg: ServerToDeviceCurrentStatusNotificationMessageMessage = {
        header: { type:  ServerToDeviceNotificationMessageType.currentStatus },
        body: {} as ServerToDeviceCurrentStatusNotificationMessageBody,
    };
    return msg;
};