import { Shift } from 'src/entities/shift.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { ShiftsSummary } from 'src/entities/shifts-summary.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorGetShiftsRequestMessageBody {
    fromDate: string;
    toDate: string;
    userId?: number | null;
}

export type OperatorGetShiftsRequestMessage = OperatorRequestMessage<OperatorGetShiftsRequestMessageBody>;


export interface OperatorGetShiftsReplyMessageBody {
    shifts: Shift[];
    shiftsSummary: ShiftsSummary;
}

export type OperatorGetShiftsReplyMessage = OperatorReplyMessage<OperatorGetShiftsReplyMessageBody>;

export function createOperatorGetShiftsReplyMessage(): OperatorGetShiftsReplyMessage {
    const msg: OperatorGetShiftsReplyMessage = {
        header: { type: OperatorReplyMessageType.getShiftsReply },
        body: {} as OperatorGetShiftsReplyMessageBody,
    };
    return msg;
};