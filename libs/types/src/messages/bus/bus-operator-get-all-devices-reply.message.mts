import { Device } from 'src/entities/device.mjs';
import { Message } from '../declarations/message.mjs';
import { transferSharedMessageData } from '../utils.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusOperatorGetAllDevicesReplyMessageBody {
    devices: Device[];
}

export interface BusOperatorGetAllDevicesReplyMessage extends Message<BusOperatorGetAllDevicesReplyMessageBody> {
}

export function createBusOperatorGetAllDevicesReplyMessage<TBody>(sourceMessage?: Message<TBody> | null): BusOperatorGetAllDevicesReplyMessage {
    const msg: BusOperatorGetAllDevicesReplyMessage = {
        header: { type: MessageType.busOperatorGetAllDevicesReply },
        body: {} as BusOperatorGetAllDevicesReplyMessageBody,
    };
    transferSharedMessageData(msg, sourceMessage);
    return msg;
};
