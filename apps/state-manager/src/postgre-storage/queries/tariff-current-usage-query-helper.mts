import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class TariffCurrentUsageQueryHelper {
    getTariffCurrentUsageQueryData(tariffId: number): IQueryTextWithParamsResult {
        const queryText = `
            SELECT
                device_id,
                start_reason AS tariff_id
            FROM device_status
            WHERE started = true
                AND start_reason = $1
            UNION
            SELECT
                device_id,
                tariff_id
            FROM device_continuation
            WHERE tariff_id = $1
        `;
        const params = [
            tariffId,
        ];
        return {
            text: queryText,
            params: params,
        };
    }
}
