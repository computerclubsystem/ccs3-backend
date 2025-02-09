import { Shift } from 'src/entities/shift.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { ShiftsSummary } from 'src/entities/shifts-summary.mjs';

export interface BusGetShiftsReplyMessageBody {
    shifts: Shift[];
    shiftsSummary: ShiftsSummary;
}

export interface BusGetShiftsReplyMessage extends Message<BusGetShiftsReplyMessageBody> {
}

export function createBusGetShiftsReplyMessage(): BusGetShiftsReplyMessage {
    const msg: BusGetShiftsReplyMessage = {
        header: { type: MessageType.busGetShiftsReply },
        body: {} as BusGetShiftsReplyMessageBody,
    };
    return msg;
}