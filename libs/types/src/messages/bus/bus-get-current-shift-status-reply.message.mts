import { ShiftStatus } from 'src/entities/shift-status.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetCurrentShiftStatusReplyMessageBody {
    shiftStatus: ShiftStatus;
}

export type BusGetCurrentShiftStatusReplyMessage = Message<BusGetCurrentShiftStatusReplyMessageBody>;

export function createBusGetCurrentShiftStatusReplyMessage(): BusGetCurrentShiftStatusReplyMessage {
    const msg: BusGetCurrentShiftStatusReplyMessage = {
        header: { type: MessageType.busGetCurrentShiftStatusReply },
        body: {} as BusGetCurrentShiftStatusReplyMessageBody,
    };
    return msg;
}