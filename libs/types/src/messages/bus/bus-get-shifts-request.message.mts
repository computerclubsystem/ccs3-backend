import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';

export interface BusGetShiftsRequestMessageBody {
    fromDate: string;
    toDate: string;
    userId?: number | null;
}

export interface BusGetShiftsRequestMessage extends Message<BusGetShiftsRequestMessageBody> {
}

export function createBusGetShiftsRequestMessage(): BusGetShiftsRequestMessage {
    const msg: BusGetShiftsRequestMessage = {
        header: { type: MessageType.busGetShiftsRequest },
        body: {} as BusGetShiftsRequestMessageBody,
    };
    return msg;
}