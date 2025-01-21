import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class DeviceContinuationQueryHelper {
    deleteDeviceContinuationQuery(deviceId: number): IQueryTextWithParamsResult {
        const params = [
            deviceId,
        ];
        return {
            text: this.deleteDeviceContinuationQueryText,
            params: params,
        };
    }

    private readonly deleteDeviceContinuationQueryText = `
        DELETE FROM device_continuation
        WHERE device_id = $1;
    `;
}
