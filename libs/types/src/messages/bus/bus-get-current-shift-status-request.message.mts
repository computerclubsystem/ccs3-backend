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
}