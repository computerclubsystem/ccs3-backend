import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Shift } from 'src/entities/shift.mjs';

export interface BusCompleteShiftReplyMessageBody {
    shift: Shift;
}

export type BusCompleteShiftReplyMessage = Message<BusCompleteShiftReplyMessageBody>;

export function createBusCompleteShiftReplyMessage(): BusCompleteShiftReplyMessage {
    const msg: BusCompleteShiftReplyMessage = {
        header: { type: MessageType.busCompleteShiftReply },
        body: {} as BusCompleteShiftReplyMessageBody,
    };
    return msg;
}