import { IDeviceContinuation } from 'src/storage/entities/device-continuation.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class DeviceContinuationQueryHelper {
    updateDeviceContinuationDeviceIdQuery(sourceDeviceId: number, targetDeviceId: number): IQueryTextWithParamsResult {
        const params = [
            sourceDeviceId,
            targetDeviceId,
        ];
        return {
            text: this.updateDeviceContinuationDeviceIdQueryText,
            params: params,
        };
    }

    private readonly updateDeviceContinuationDeviceIdQueryText = `
        UPDATE device_continuation
        SET device_id = $2
        WHERE device_id = $1;
    `;

    upsertDeviceContinuationQuery(deviceContinuation: IDeviceContinuation): IQueryTextWithParamsResult {
        const params = [
            deviceContinuation.device_id,
            deviceContinuation.tariff_id,
            deviceContinuation.user_id,
            deviceContinuation.requested_at,
        ];
        return {
            text: this.upsertDeviceContinuationQueryText,
            params: params,
        };
    }

    private readonly upsertDeviceContinuationQueryText = `
        INSERT INTO device_continuation
        (
            device_id,
            tariff_id,
            user_id,
            requested_at
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4
        )
        ON CONFLICT (device_id) DO
            UPDATE
            SET device_id = $1,
                tariff_id = $2,
                user_id = $3,
                requested_at = $4
        RETURNING
            device_id,
            tariff_id,
            user_id,
            requested_at;
    `;

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
