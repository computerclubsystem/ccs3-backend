import { TariffShortInfo } from 'src/entities/tariff.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { DeviceStatus } from './bus-device-statuses-notification.message.mjs';

export type BusGetDeviceStatusesRequestMessageBody = object;

export type BusGetDeviceStatusesRequestMessage = Message<BusGetDeviceStatusesRequestMessageBody>;

export function createBusGetDeviceStatusesRequestMessage(): BusGetDeviceStatusesRequestMessage {
    const msg: BusGetDeviceStatusesRequestMessage = {
        header: { type: MessageType.busGetDeviceStatusesRequest },
        body: {},
    };
    return msg;
}


export interface BusGetDeviceStatusesReplyMessageBody {
    deviceStatuses: DeviceStatus[];
    continuationTariffShortInfos?: TariffShortInfo[];
}

export type BusGetDeviceStatusesReplyMessage = Message<BusGetDeviceStatusesReplyMessageBody>;

export function createBusGetDeviceStatusesReplyMessage(): BusGetDeviceStatusesReplyMessage {
    const msg: BusGetDeviceStatusesReplyMessage = {
        header: { type: MessageType.busGetDeviceStatusesReply },
        body: {} as BusGetDeviceStatusesReplyMessageBody,
    };
    return msg;
}