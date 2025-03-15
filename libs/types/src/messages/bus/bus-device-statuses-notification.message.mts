import { TariffShortInfo } from 'src/entities/tariff.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface DeviceStatus {
    deviceId: number;
    started: boolean;
    tariff?: number | null;
    continuationTariffId?: number | null;
    totalSum: number | null;
    totalTime: number | null;
    startedAt: number | null;
    stoppedAt: number | null;
    expectedEndAt: number | null;
    remainingSeconds: number | null;
    enabled: boolean;
    startedByUserId?: number | null;
    canBeStoppedByCustomer?: boolean | null;
    note?: string | null;
}

export interface BusDeviceStatusesNotificationMessageBody {
    deviceStatuses: DeviceStatus[];
    continuationTariffShortInfos?: TariffShortInfo[];
}

export type BusDeviceStatusesNotificationMessage = Message<BusDeviceStatusesNotificationMessageBody>;

export function createBusDeviceStatusesNotificationMessage(): BusDeviceStatusesNotificationMessage {
    const msg: BusDeviceStatusesNotificationMessage = {
        header: { type: MessageType.busDeviceStatusesNotification },
        body: {} as BusDeviceStatusesNotificationMessageBody,
    };
    return msg;
};