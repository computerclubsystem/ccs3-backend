import { Message } from '../declarations/message.mjs';
import { MessageType } from '../declarations/message-type.mjs';
import { OperatorConnectionEventType } from '../../entities/declarations/operator-connection-event-type.mjs';

export interface BusOperatorConnectionEventMessageBody {
    operatorId: number;
    ipAddress: string | null;
    type: OperatorConnectionEventType;
    note?: string;
}

export interface BusOperatorConnectionEventMessage extends Message<BusOperatorConnectionEventMessageBody> {
}

export function createBusOperatorConnectionEventMessage(): BusOperatorConnectionEventMessage {
    const msg: BusOperatorConnectionEventMessage = {
        header: { type: MessageType.busOperatorConnectionEvent },
        body: {} as BusOperatorConnectionEventMessageBody,
    };
    return msg;
};
