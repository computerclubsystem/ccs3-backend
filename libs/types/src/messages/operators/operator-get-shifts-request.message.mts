import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorGetShiftsRequestMessageBody {
    fromDate: string;
    toDate: string;
    userId?: number | null;
}

export interface OperatorGetShiftsRequestMessage extends OperatorRequestMessage<OperatorGetShiftsRequestMessageBody>{
}