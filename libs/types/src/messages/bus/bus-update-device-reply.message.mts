import { Device } from 'src/entities/device.mjs';
import { Message } from '../declarations/message.mjs';
import { transferSharedMessageData } from '../utils.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusUpdateDeviceReplyMessageBody {
    device?: Device;
}

export interface BusUpdateDeviceReplyMessage extends Message<BusUpdateDeviceReplyMessageBody> {
}

export function createBusUpdateDeviceReplyMessage<TBody>(sourceMessage?: Message<TBody> | null): BusUpdateDeviceReplyMessage {
    const msg: BusUpdateDeviceReplyMessage = {
        header: { type: MessageType.busUpdateDeviceReply },
        body: {} as BusUpdateDeviceReplyMessageBody,
    };
    transferSharedMessageData(msg, sourceMessage);
    return msg;
};
