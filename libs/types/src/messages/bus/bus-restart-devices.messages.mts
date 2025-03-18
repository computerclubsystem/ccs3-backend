import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusRestartDevicesRequestMessageBody {
    deviceIds: number[];
}

export type BusRestartDevicesRequestMessage = Message<BusRestartDevicesRequestMessageBody>;

export function createBusRestartDevicesRequestMessage(): BusRestartDevicesRequestMessage {
    const msg: BusRestartDevicesRequestMessage = {
        header: { type: MessageType.busRestartDevicesRequest },
        body: {} as BusRestartDevicesRequestMessageBody,
    };
    return msg;
}


export interface BusRestartDevicesReplyMessageBody {
    targetsCount: number;
}

export type BusRestartDevicesReplyMessage = Message<BusRestartDevicesReplyMessageBody>;

export function createBusRestartDevicesReplyMessage(): BusRestartDevicesReplyMessage {
    const msg: BusRestartDevicesReplyMessage = {
        header: { type: MessageType.busRestartDevicesReply },
        body: {} as BusRestartDevicesReplyMessageBody,
    };
    return msg;
}