import { OperatorRoundTripData } from './operator-round-trip-data.mjs';

export interface OperatorConnectionRoundTripData extends OperatorRoundTripData {
    connectionId: number;
    /**
     * Since the connectionId is monotonically increasing number starting from 1
     * we need another random ID to distinguish connections between service instances that own the connection
     */
    connectionInstanceId: string;
}
