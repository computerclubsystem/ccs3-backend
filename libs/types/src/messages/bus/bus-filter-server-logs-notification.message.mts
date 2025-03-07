import { MessageType } from '../declarations/message-type.mjs';
import { Message } from '../declarations/message.mjs';
import { FilterServerLogsItem } from '../shared-declarations/filter-server-logs-item.mjs';

export interface BusFilterServerLogsNotificationMessageBody {
    filterServerLogsItems: FilterServerLogsItem[];
}

export type BusFilterServerLogsNotificationMessage = Message<BusFilterServerLogsNotificationMessageBody>;

export function createBusFilterServerLogsNotificationMessage(): BusFilterServerLogsNotificationMessage {
    const msg: BusFilterServerLogsNotificationMessage = {
        header: { type: MessageType.busFilterServerLogsNotification },
        body: {} as BusFilterServerLogsNotificationMessageBody,
    };
    return msg;
}
