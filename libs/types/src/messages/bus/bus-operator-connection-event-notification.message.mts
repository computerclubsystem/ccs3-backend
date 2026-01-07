import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { OperatorConnectionEventType } from '../../entities/declarations/operator-connection-event-type.mjs';

export interface BusOperatorConnectionEventNotificationMessageBody {
    operatorId: number;
    ipAddress: string | null;
    type: OperatorConnectionEventType;
    note?: string;
}

export type BusOperatorConnectionEventNotificationMessage = Message<BusOperatorConnectionEventNotificationMessageBody>;

export function createBusOperatorConnectionEventNotificationMessage(): BusOperatorConnectionEventNotificationMessage {
    const msg: BusOperatorConnectionEventNotificationMessage = {
        header: { type: MessageType.busUserConnectionEventNotification },
        body: {} as BusOperatorConnectionEventNotificationMessageBody,
    };
    return msg;
};
