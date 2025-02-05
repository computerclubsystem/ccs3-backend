import { ShiftStatus } from 'src/entities/shift-status.mjs';
import { OperatorMessage } from './declarations/operator.message.mjs';

export interface OperatorCompleteShiftRequestMessageBody {
    // This is needed to compare what the user knows about the shift and the current status
    // If there is difference, then the user is trying to complete shift with stale information
    // In such cases the user needs to refresh the current shift status to see the new data
    shiftStatus: ShiftStatus;
    note?: string | null;
}

export type OperatorCompleteShiftRequestMessage = OperatorMessage<OperatorCompleteShiftRequestMessageBody>;
