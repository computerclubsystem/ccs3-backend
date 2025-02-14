import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class ShiftDeviceContinuationQueryHelper {
    insertAllDeviceContinuationsQueryData(shiftId: number): IQueryTextWithParamsResult {
        const params = [
            shiftId,
        ];
        return {
            text: this.insertAllDeviceContinuationsQueryText,
            params: params,
        };
    }

    private readonly insertAllDeviceContinuationsQueryText = `
        INSERT INTO shift_device_continuation
        (
            shift_id,
            device_id,
            tariff_id,
            user_id,
            requested_at
        )
        SELECT
            $1 AS shift_id,
            device_id,
            tariff_id,
            user_id,
            requested_at
        FROM device_continuation
    `;
}
