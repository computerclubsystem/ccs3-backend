import { ShiftStatus } from 'src/entities/shift-status.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';

export type OperatorGetCurrentShiftStatusRequestMessageBody = object;

export type OperatorGetCurrentShiftStatusRequestMessage = OperatorRequestMessage<OperatorGetCurrentShiftStatusRequestMessageBody>;


export interface OperatorGetCurrentShiftStatusReplyMessageBody {
    shiftStatus: ShiftStatus;
}

export type OperatorGetCurrentShiftStatusReplyMessage = OperatorReplyMessage<OperatorGetCurrentShiftStatusReplyMessageBody>;

export function createOperatorGetCurrentShiftStatusReplyMessage(): OperatorGetCurrentShiftStatusReplyMessage {
    const msg: OperatorGetCurrentShiftStatusReplyMessage = {
        header: { type: OperatorReplyMessageType.getCurrentShiftStatusReply },
        body: {} as OperatorGetCurrentShiftStatusReplyMessageBody,
    };
    return msg;
};