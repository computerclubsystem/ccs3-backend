import { OperatorConnectionEventType } from './constants/operator-connection-event-type.mjs';

export interface IOperatorConnectionEvent {
    id: number;
    operator_id: number;
    ip_address?: string;
    note?: string;
    type: OperatorConnectionEventType;
    timestamp: string;
}
