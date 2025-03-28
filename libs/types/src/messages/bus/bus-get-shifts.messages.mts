import { Shift } from 'src/entities/shift.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { ShiftsSummary } from 'src/entities/shifts-summary.mjs';

export interface BusGetShiftsRequestMessageBody {
    fromDate: string;
    toDate: string;
    userId?: number | null;
}

export type BusGetShiftsRequestMessage = Message<BusGetShiftsRequestMessageBody>;

export function createBusGetShiftsRequestMessage(): BusGetShiftsRequestMessage {
    const msg: BusGetShiftsRequestMessage = {
        header: { type: MessageType.busGetShiftsRequest },
        body: {} as BusGetShiftsRequestMessageBody,
    };
    return msg;
};


export interface BusGetShiftsReplyMessageBody {
    shifts: Shift[];
    shiftsSummary: ShiftsSummary;
}

export type BusGetShiftsReplyMessage = Message<BusGetShiftsReplyMessageBody>;

export function createBusGetShiftsReplyMessage(): BusGetShiftsReplyMessage {
    const msg: BusGetShiftsReplyMessage = {
        header: { type: MessageType.busGetShiftsReply },
        body: {} as BusGetShiftsReplyMessageBody,
    };
    return msg;
}