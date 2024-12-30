import { OperatorConnectionEventType } from 'src/storage/entities/constants/operator-connection-event-type.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { IOperatorConnectionEvent } from 'src/storage/entities/operator-connection-event.mjs';

export class OperatorConnectionQueryHelper {
    addOperatorConnectionQueryData(operatorConnectionEvent: IOperatorConnectionEvent): IQueryTextWithParamsResult {
        const params: [
            number,
            string | undefined,
            OperatorConnectionEventType,
            string | undefined,
            string
        ] = [
                operatorConnectionEvent.operator_id,
                operatorConnectionEvent.ip_address,
                operatorConnectionEvent.type,
                operatorConnectionEvent.note,
                operatorConnectionEvent.timestamp,
            ];
        return {
            text: this.addOperatorConnectionQueryText,
            params,
        };
    }

    private readonly addOperatorConnectionQueryText = `
        INSERT INTO operator_connection_event
        (
            operator_id,
            ip_address,
            type,
            note,
            timestamp
        )
        VALUES
        (
            $1, $2, $3, $4, $5
        )
        RETURNING 
            id,
            operator_id,
            ip_address,
            type,
            note,
            timestamp
    `;
}
