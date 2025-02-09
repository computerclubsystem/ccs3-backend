import { MessageError } from 'src/messages/declarations/message-error.mjs';
import { OperatorRequestMessageType, OperatorNotificationMessageType, OperatorReplyMessageType } from './operator-message-type.mjs';
import { OperatorRoundTripData } from './operator-round-trip-data.mjs';

export interface OperatorRequestMessageHeader {
    type: OperatorRequestMessageType;
    correlationId?: string;
    // source?: string;
    // target?: string;
    token?: string;
    roundTripData?: OperatorRoundTripData;
    // failure?: boolean;
    // errors?: MessageError[];
}

export interface OperatorReplyMessageHeader {
    type: OperatorReplyMessageType;
    correlationId?: string;
    roundTripData?: OperatorRoundTripData;
    failure?: boolean;
    requestType?: string;
    errors?: MessageError[];
}

export interface OperatorNotificationMessageHeader {
    type: OperatorNotificationMessageType;
    failure?: boolean;
    errors?: MessageError[];
}