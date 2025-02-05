import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage } from './declarations/operator.message.mjs';
import { Shift } from 'src/entities/shift.mjs';

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
}
