import { Device } from 'src/entities/device.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusDeviceGetByCertificateRequestMessageBody {
    certificateThumbprint: string;
}

export type BusDeviceGetByCertificateRequestMessage = Message<BusDeviceGetByCertificateRequestMessageBody>;

export function createBusDeviceGetByCertificateRequestMessage(): BusDeviceGetByCertificateRequestMessage {
    const msg: BusDeviceGetByCertificateRequestMessage = {
        header: { type: MessageType.busDeviceGetByCertificateRequest },
        body: {} as BusDeviceGetByCertificateRequestMessageBody,
    };
    return msg;
};


export interface BusDeviceGetByCertificateReplyMessageBody {
    device: Device;
}

export type BusDeviceGetByCertificateReplyMessage = Message<BusDeviceGetByCertificateReplyMessageBody>;

export function createBusDeviceGetByCertificateReplyMessage(): BusDeviceGetByCertificateReplyMessage {
    const msg: BusDeviceGetByCertificateReplyMessage = {
        header: { type: MessageType.busDeviceGetByCertificateReply },
        body: {} as BusDeviceGetByCertificateReplyMessageBody,
    };
    return msg;
};
