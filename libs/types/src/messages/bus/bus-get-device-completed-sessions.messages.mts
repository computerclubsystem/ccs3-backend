import { DeviceSession } from 'src/entities/device-session.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { TariffUsage } from '../shared-declarations/tariff-usage.mjs';
import { DeviceUsage } from '../shared-declarations/device-usage.mjs';

export interface BusGetDeviceCompletedSessionsRequestMessageBody {
    fromDate: string;
    toDate: string;
    deviceId?: number | null;
    userId?: number | null;
    tariffId?: number | null;
}

export type BusGetDeviceCompletedSessionsRequestMessage = Message<BusGetDeviceCompletedSessionsRequestMessageBody>;

export function createBusGetDeviceCompletedSessionsRequestMessage(): BusGetDeviceCompletedSessionsRequestMessage {
    const msg: BusGetDeviceCompletedSessionsRequestMessage = {
        header: { type: MessageType.busGetDeviceCompletedSessionsRequest },
        body: {} as BusGetDeviceCompletedSessionsRequestMessageBody,
    };
    return msg;
}

export interface BusGetDeviceCompletedSessionsReplyMessageBody {
    deviceSessions: DeviceSession[];
    totalSum: number;
    tariffUsages: TariffUsage[];
    deviceUsages: DeviceUsage[];
}

export type BusGetDeviceCompletedSessionsReplyMessage = Message<BusGetDeviceCompletedSessionsReplyMessageBody>;

export function createBusGetDeviceCompletedSessionsReplyMessage(): BusGetDeviceCompletedSessionsReplyMessage {
    const msg: BusGetDeviceCompletedSessionsReplyMessage = {
        header: { type: MessageType.busGetDeviceCompletedSessionsReply },
        body: {} as BusGetDeviceCompletedSessionsReplyMessageBody,
    };
    return msg;
}