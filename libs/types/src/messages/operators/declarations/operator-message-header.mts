import { MessageError } from 'src/messages/declarations/message-error.mjs';
import { OperatorMessageType, OperatorNotificationMessageType, OperatorReplyMessageType } from './operator-message-type.mjs';
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

export interface OperatorReplyMessageHeader {
    type: OperatorReplyMessageType;
    correlationId?: string;
    roundTripData?: OperatorRoundTripData;
    failure?: boolean;
    errors?: MessageError[];
}

export interface OperatorNotificationMessageHeader {
    type: OperatorNotificationMessageType;
    failure?: boolean;
    errors?: MessageError[];
}