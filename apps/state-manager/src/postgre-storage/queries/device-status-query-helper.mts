// INSERT INTO table_name (column1, column2, ...)
// VALUES (value1, value2, ...)
// ON CONFLICT (conflict_column)
// DO NOTHING | DO UPDATE SET column1 = value1, column2 = value2, ...;

import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class DeviceStatusQueryHelper {
    getDeviceStatusQuery(deviceId: number): IQueryTextWithParamsResult {
        const params: [
            number
        ] = [
                deviceId,
            ];
        return {
            text: this.getDeviceStatusQueryText,
            params,
        };
    }

    public readonly getAllDeviceStatusesQueryText = `
        SELECT 
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total
        FROM device_status
    `;

    private readonly getDeviceStatusQueryText = `
        SELECT 
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total
        FROM device_status
        WHERE device_id = $1
    `;
}
