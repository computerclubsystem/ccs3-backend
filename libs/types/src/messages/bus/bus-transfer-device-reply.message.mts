import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { DeviceStatus } from './bus-device-statuses.message.mjs';

export interface BusTransferDeviceReplyMessageBody {
    sourceDeviceStatus?: DeviceStatus | null;
    targetDeviceStatus?: DeviceStatus | null;
}

export interface BusTransferDeviceReplyMessage extends Message<BusTransferDeviceReplyMessageBody> {
}

export function createBusTransferDeviceReplyMessage(): BusTransferDeviceReplyMessage {
    const msg: BusTransferDeviceReplyMessage = {
        header: { type: MessageType.busTransferDeviceReply },
        body: {} as BusTransferDeviceReplyMessageBody,
    };
    return msg;
};
