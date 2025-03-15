import { ShiftStatus } from 'src/entities/shift-status.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export type BusGetCurrentShiftStatusRequestMessageBody = object;

export type BusGetCurrentShiftStatusRequestMessage = Message<BusGetCurrentShiftStatusRequestMessageBody>;

export function createBusGetCurrentShiftStatusRequestMessage(): BusGetCurrentShiftStatusRequestMessage {
    const msg: BusGetCurrentShiftStatusRequestMessage = {
        header: { type: MessageType.busGetCurrentShiftStatusRequest },
        body: {} as BusGetCurrentShiftStatusRequestMessageBody,
    };
    return msg;
};


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