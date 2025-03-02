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

export interface BusDeviceStatusesMessageBody {
    deviceStatuses: DeviceStatus[];
    continuationTariffShortInfos?: TariffShortInfo[];
}

export interface BusDeviceStatusesMessage extends Message<BusDeviceStatusesMessageBody> {
}

export function createBusDeviceStatusesMessage(): BusDeviceStatusesMessage {
    const msg: BusDeviceStatusesMessage = {
        header: { type: MessageType.busDeviceStatuses },
        body: {} as BusDeviceStatusesMessageBody,
    };
    return msg;
};