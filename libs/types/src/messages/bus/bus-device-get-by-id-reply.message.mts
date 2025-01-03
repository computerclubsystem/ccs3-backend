import { Device } from 'src/entities/device.mjs';
import { Message } from '../declarations/message.mjs';
import { transferSharedMessageData } from '../utils.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusDeviceGetByIdReplyMessageBody {
    device: Device;
}

export interface BusDeviceGetByIdReplyMessage extends Message<BusDeviceGetByIdReplyMessageBody> {
}

export function createBusDeviceGetByIdReplyMessage<TBody>(sourceMessage?: Message<TBody> | null): BusDeviceGetByIdReplyMessage {
    const msg: BusDeviceGetByIdReplyMessage = {
        header: { type: MessageType.busOperatorGetDeviceByIdReply },
        body: {} as BusDeviceGetByIdReplyMessageBody,
    };
    transferSharedMessageData(msg, sourceMessage);
    return msg;
};
