import {
    OperatorRequestMessageHeader, OperatorNotificationMessageHeader, OperatorReplyMessageHeader
} from './operator-message-header.mjs';

export interface OperatorRequestMessage<TBody> {
    header: OperatorRequestMessageHeader;
    body: TBody;
}

export interface OperatorReplyMessage<TBody> {
    header: OperatorReplyMessageHeader;
    body: TBody;
}

export interface OperatorNotificationMessage<TBody> {
    header: OperatorNotificationMessageHeader;
    body: TBody;
}