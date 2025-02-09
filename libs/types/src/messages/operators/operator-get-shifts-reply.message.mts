import { Shift } from 'src/entities/shift.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { ShiftsSummary } from 'src/entities/shifts-summary.mjs';

export interface OperatorGetShiftsReplyMessageBody {
    shifts: Shift[];
    shiftsSummary: ShiftsSummary;
}

export interface OperatorGetShiftsReplyMessage extends OperatorReplyMessage<OperatorGetShiftsReplyMessageBody> {
}

export function createOperatorGetShiftsReplyMessage(): OperatorGetShiftsReplyMessage {
    const msg: OperatorGetShiftsReplyMessage = {
        header: { type: OperatorReplyMessageType.getShiftsReply },
        body: {} as OperatorGetShiftsReplyMessageBody,
    };
    return msg;
}