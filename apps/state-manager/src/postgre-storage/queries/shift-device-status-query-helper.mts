import { IShiftDeviceStatus } from 'src/storage/entities/shift-device-status.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class ShiftDeviceStatusQueryHelper {
    insertAllDeviceStatusesQueryData(shiftId: number): IQueryTextWithParamsResult {
        const params = [
            shiftId,
        ];
        return {
            text: this.insertAllDeviceStatusesQueryText,
            params: params,
        };
    }

    private insertAllDeviceStatusesQueryText = `
        INSERT INTO shift_device_status
        (
            shift_id,
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled,
            started_by_user_id,
            stopped_by_user_id
        )
        SELECT
            $1 AS shift_id,
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled,
            started_by_user_id,
            stopped_by_user_id
        FROM device_status
    `;

    addShiftDeviceStatus(shiftDeviceStatus: IShiftDeviceStatus): IQueryTextWithParamsResult {
        const params = [

            shiftDeviceStatus.shift_id,
            shiftDeviceStatus.device_id,
            shiftDeviceStatus.started,
            shiftDeviceStatus.start_reason,
            shiftDeviceStatus.started_at,
            shiftDeviceStatus.stopped_at,
            shiftDeviceStatus.total,
            shiftDeviceStatus.enabled,
            shiftDeviceStatus.started_by_user_id,
            shiftDeviceStatus.stopped_by_user_id,
        ];

        return {
            text: this.addShiftDeviceStatusQueryText,
            params: params,
        };
    }

    private readonly addShiftDeviceStatusQueryText = `
        INSERT INTO shift_device_status
        (
            shift_id,
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled,
            started_by_user_id,
            stopped_by_user_id
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10
        )
        RETURNING
            id,
            shift_id,
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled,
            started_by_user_id,
            stopped_by_user_id
    `;
}