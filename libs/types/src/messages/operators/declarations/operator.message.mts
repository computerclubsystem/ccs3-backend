import {
    OperatorMessageHeader, OperatorNotificationMessageHeader, OperatorReplyMessageHeader
} from './operator-message-header.mjs';

export interface OperatorMessage<TBody> {
    header: OperatorMessageHeader;
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