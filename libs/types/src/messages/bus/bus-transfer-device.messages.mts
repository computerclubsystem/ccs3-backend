import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { DeviceStatus } from './bus-device-statuses-notification.message.mjs';

export interface BusTransferDeviceRequestMessageBody {
    sourceDeviceId: number;
    targetDeviceId: number;
    userId: number;
    transferNote?: boolean | null;
}

export type BusTransferDeviceRequestMessage = Message<BusTransferDeviceRequestMessageBody>;

export function createBusTransferDeviceRequestMessage(): BusTransferDeviceRequestMessage {
    const msg: BusTransferDeviceRequestMessage = {
        header: { type: MessageType.busTransferDeviceRequest },
        body: {} as BusTransferDeviceRequestMessageBody,
    };
    return msg;
};


export interface BusTransferDeviceReplyMessageBody {
    sourceDeviceStatus?: DeviceStatus | null;
    targetDeviceStatus?: DeviceStatus | null;
}

export type BusTransferDeviceReplyMessage = Message<BusTransferDeviceReplyMessageBody>;

export function createBusTransferDeviceReplyMessage(): BusTransferDeviceReplyMessage {
    const msg: BusTransferDeviceReplyMessage = {
        header: { type: MessageType.busTransferDeviceReply },
        body: {} as BusTransferDeviceReplyMessageBody,
    };
    return msg;
};
