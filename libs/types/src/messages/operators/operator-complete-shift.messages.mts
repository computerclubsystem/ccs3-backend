import { ShiftStatus } from 'src/entities/shift-status.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { Shift } from 'src/entities/shift.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export interface OperatorCompleteShiftRequestMessageBody {
    // This is needed to compare what the user knows about the shift and the current status
    // If there is difference, then the user is trying to complete shift with stale information
    // In such cases the user needs to refresh the current shift status to see the new data
    shiftStatus: ShiftStatus;
    note?: string | null;
}

export type OperatorCompleteShiftRequestMessage = OperatorRequestMessage<OperatorCompleteShiftRequestMessageBody>;


export interface OperatorCompleteShiftReplyMessageBody {
    shift: Shift;
}

export type OperatorCompleteShiftReplyMessage = OperatorReplyMessage<OperatorCompleteShiftReplyMessageBody>;

export function createOperatorCompleteShiftReplyMessage(): OperatorCompleteShiftReplyMessage {
    const msg: OperatorCompleteShiftReplyMessage = {
        header: { type: OperatorReplyMessageType.completeShiftReply },
        body: {} as OperatorCompleteShiftReplyMessageBody,
    };
    return msg;
};