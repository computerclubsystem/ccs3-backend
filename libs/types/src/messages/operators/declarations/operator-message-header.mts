import { MessageError } from '../../declarations/message-error.mjs';
import { OperatorMessageType } from './operator-message-type.mjs';
import { OperatorRoundTripData } from './operator-round-trip-data.mjs';

export interface OperatorMessageHeader {
    type: OperatorMessageType;
    correlationId?: string;
    // source?: string;
    // target?: string;
    token?: string;
    roundTripData?: OperatorRoundTripData;
    // failure?: boolean;
    // errors?: MessageError[];
}
