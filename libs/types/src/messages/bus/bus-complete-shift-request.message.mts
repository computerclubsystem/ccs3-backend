import { ShiftStatus } from 'src/entities/shift-status.mjs';
import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';

export interface BusCompleteShiftRequestMessageBody {
    // This is used to compare it with current shift status and if there is difference, error will be returned
    shiftStatus: ShiftStatus;
    userId: number;
    note?: string | null;
}

export type BusCompleteShiftRequestMessage = Message<BusCompleteShiftRequestMessageBody>;

export function createBusCompleteShiftRequestMessage(): BusCompleteShiftRequestMessage {
    const msg: BusCompleteShiftRequestMessage = {
        header: { type: MessageType.busCompleteShiftRequest },
        body: {} as BusCompleteShiftRequestMessageBody,
    };
    return msg;
}