import { FilterServerLogsItem } from '../shared-declarations/filter-server-logs-item.mjs';
import { OperatorReplyMessageType } from './declarations/operator-message-type.mjs';
import { OperatorReplyMessage, OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorFilterServerLogsRequestMessageBody {
    filterServerLogsItems: FilterServerLogsItem[];
}

export type OperatorFilterServerLogsRequestMessage = OperatorRequestMessage<OperatorFilterServerLogsRequestMessageBody>;


export type OperatorFilterServerLogsReplyMessageBody = object;

export type OperatorFilterServerLogsReplyMessage = OperatorReplyMessage<OperatorFilterServerLogsReplyMessageBody>;

export function createOperatorFilterServerLogsReplyMessage(): OperatorFilterServerLogsReplyMessage {
    const msg: OperatorFilterServerLogsReplyMessage = {
        header: { type: OperatorReplyMessageType.filterServerLogsReply },
        body: {},
    };
    return msg;
}