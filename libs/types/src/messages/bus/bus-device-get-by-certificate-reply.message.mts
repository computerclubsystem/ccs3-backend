import { Device } from 'src/entities/device.mjs';
import { Message } from '../declarations/message.mjs';
import { transferSharedMessageData } from '../utils.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusDeviceGetByCertificateReplyMessageBody {
    device: Device;
}

export interface BusDeviceGetByCertificateReplyMessage extends Message<BusDeviceGetByCertificateReplyMessageBody> {
}

export function createBusDeviceGetByCertificateReplyMessage<TBody>(sourceMessage?: Message<TBody> | null): BusDeviceGetByCertificateReplyMessage {
    const msg: BusDeviceGetByCertificateReplyMessage = {
        header: { type: MessageType.busDeviceGetByCertificateReply },
        body: {} as BusDeviceGetByCertificateReplyMessageBody,
    };
    transferSharedMessageData(msg, sourceMessage);
    return msg;
};
