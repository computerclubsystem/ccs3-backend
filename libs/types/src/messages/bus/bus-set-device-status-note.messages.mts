import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusSetDeviceStatusNoteRequestMessageBody {
    deviceId: number;
    note: string | null;
}

export type BusSetDeviceStatusNoteRequestMessage = Message<BusSetDeviceStatusNoteRequestMessageBody>;

export function createBusSetDeviceStatusNoteRequestMessage(): BusSetDeviceStatusNoteRequestMessage {
    const msg: BusSetDeviceStatusNoteRequestMessage = {
        header: { type: MessageType.busSetDeviceStatusNoteRequest },
        body: {} as BusSetDeviceStatusNoteRequestMessageBody,
    };
    return msg;
}


export type BusSetDeviceStatusNoteReplyMessageBody = object;

export type BusSetDeviceStatusNoteReplyMessage = Message<BusSetDeviceStatusNoteReplyMessageBody>;

export function createBusSetDeviceStatusNoteReplyMessage(): BusSetDeviceStatusNoteReplyMessage {
    const msg: BusSetDeviceStatusNoteReplyMessage = {
        header: { type: MessageType.busSetDeviceStatusNoteReply },
        body: {},
    };
    return msg;
}