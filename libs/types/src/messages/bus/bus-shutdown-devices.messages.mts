import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusShutdownDevicesRequestMessageBody {
    deviceIds: number[];
}

export type BusShutdownDevicesRequestMessage = Message<BusShutdownDevicesRequestMessageBody>;

export function createBusShutdownDevicesRequestMessage(): BusShutdownDevicesRequestMessage {
    const msg: BusShutdownDevicesRequestMessage = {
        header: { type: MessageType.busShutdownDevicesRequest },
        body: {} as BusShutdownDevicesRequestMessageBody,
    };
    return msg;
}


export interface BusShutdownDevicesReplyMessageBody {
    targetsCount: number;
}

export type BusShutdownDevicesReplyMessage = Message<BusShutdownDevicesReplyMessageBody>;

export function createBusShutdownDevicesReplyMessage(): BusShutdownDevicesReplyMessage {
    const msg: BusShutdownDevicesReplyMessage = {
        header: { type: MessageType.busShutdownDevicesReply },
        body: {} as BusShutdownDevicesReplyMessageBody,
    };
    return msg;
}