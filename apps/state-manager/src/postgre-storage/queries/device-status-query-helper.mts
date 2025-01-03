// INSERT INTO table_name (column1, column2, ...)
// VALUES (value1, value2, ...)
// ON CONFLICT (conflict_column)
// DO NOTHING | DO UPDATE SET column1 = value1, column2 = value2, ...;

import { IDeviceStatus } from 'src/storage/entities/device-status.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class DeviceStatusQueryHelper {
    updateDeviceStatusQuery(deviceStatus: IDeviceStatus): IQueryTextWithParamsResult {
        const params = [
            deviceStatus.started,
            deviceStatus.start_reason,
            deviceStatus.started_at,
            deviceStatus.stopped_at,
            deviceStatus.total,
            deviceStatus.enabled,
            deviceStatus.device_id,
        ];
        return {
            text: this.updateDeviceStatusQueryText,
            params: params,
        };
    }

    addOrUpdateDeviceStatusEnabledQuery(deviceStatus: IDeviceStatus): IQueryTextWithParamsResult {
        const params: [
            number,
            boolean,
            number | null,
            string | null,
            string | null,
            number | null,
            boolean,
        ] = [
                deviceStatus.device_id,
                deviceStatus.started,
                deviceStatus.start_reason,
                deviceStatus.started_at,
                deviceStatus.stopped_at,
                deviceStatus.total,
                deviceStatus.enabled,
            ];
        return {
            text: this.addDeviceStatusQueryText,
            params,
        };
    }

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

    // setDeviceStatusEnabledFlagQuery(deviceId: number, enabled: boolean): IQueryTextWithParamsResult {
    //     const params: [
    //         boolean,
    //         number,
    //     ] = [
    //         enabled,
    //         deviceId,
    //         ];
    //     return {
    //         text: this.setDeviceStatusEnabledFlagQueryText,
    //         params: params,
    //     };
    // }

    // private readonly setDeviceStatusEnabledFlagQueryText = `
    //     UPDATE device_status
    //     SET enabled = $1
    //     WHERE device_id = $2
    // `;

    private readonly updateDeviceStatusQueryText = `
        UPDATE device_status
        SET started = $1,
            start_reason = $2,
            started_at = $3,
            stopped_at = $4,
            total = $5,
            enabled = $6
        WHERE device_id = $7
    `;

    private readonly addDeviceStatusQueryText = `
        INSERT INTO device_status 
        (
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
        )
        ON CONFLICT (device_id) DO
            UPDATE SET enabled = $7
    `;

    public readonly getAllDeviceStatusesQueryText = `
        SELECT 
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled
        FROM device_status
    `;

    private readonly getDeviceStatusQueryText = `
        SELECT 
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled
        FROM device_status
        WHERE device_id = $1
    `;
}
