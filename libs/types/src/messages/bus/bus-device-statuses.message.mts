// import { DeviceState } from 'src/entities/device-state.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface DeviceStatus {
    deviceId: number;
    started: boolean;
    tariff?: number | null;
    totalSum: number | null;
    totalTime: number | null;
    startedAt: number | null;
    stoppedAt: number | null;
    expectedEndAt: number | null;
    remainingSeconds: number | null;
    enabled: boolean;
    startedByUserId?: number | null;
}

export interface BusDeviceStatusesMessageBody {
    deviceStatuses: DeviceStatus[];
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