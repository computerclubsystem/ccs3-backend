import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusDeviceUnknownDeviceConnectedRequestMessageBody {
    certificateThumbprint: string;
    certificateSubject: string;
    certificateCommonName: string;
    ipAddress: string;
}

export type BusDeviceUnknownDeviceConnectedRequestMessage = Message<BusDeviceUnknownDeviceConnectedRequestMessageBody>;

export function createBusDeviceUnknownDeviceConnectedRequestMessage(): BusDeviceUnknownDeviceConnectedRequestMessage {
    const msg: BusDeviceUnknownDeviceConnectedRequestMessage = {
        header: { type: MessageType.busDeviceUnknownDeviceConnectedRequest },
        body: {} as BusDeviceUnknownDeviceConnectedRequestMessageBody,
    };
    return msg;
};


export interface BusDeviceUnknownDeviceConnectedReplyMessageBody {
    id: number;
}

export type BusDeviceUnknownDeviceConnectedReplyMessage = Message<BusDeviceUnknownDeviceConnectedReplyMessageBody>;

export function createBusDeviceUnknownDeviceConnectedReplyMessage(): BusDeviceUnknownDeviceConnectedReplyMessage {
    const msg: BusDeviceUnknownDeviceConnectedReplyMessage = {
        header: { type: MessageType.busDeviceUnknownDeviceConnectedReply },
        body: {} as BusDeviceUnknownDeviceConnectedReplyMessageBody,
    };
    return msg;
};