// INSERT INTO table_name (column1, column2, ...)
// VALUES (value1, value2, ...)
// ON CONFLICT (conflict_column)
// DO NOTHING | DO UPDATE SET column1 = value1, column2 = value2, ...;

import { IDevice } from 'src/storage/entities/device.mjs';
import { IQueryTextWithParamsResult } from "./query-with-params.mjs";

export class DeviceQueryHelper {
    updateDeviceQueryData(device: IDevice): IQueryTextWithParamsResult {
        const params: [
            string,
            string,
            string | undefined,
            string | undefined,
            boolean,
            boolean,
            number | undefined,
            number,
        ] = [
                device.certificate_thumbprint,
                device.ip_address,
                device.name,
                device.description,
                device.approved,
                device.enabled,
                device.device_group_id,
                device.id,
            ];
        return {
            text: this.updateDeviceQueryText,
            params,
        }
    }

    getDeviceStatusQuery(deviceId: number): IQueryTextWithParamsResult {
        const params: [
            number
        ] = [
                deviceId,
            ];
        return {
            text: this.getDeviceQueryText,
            params: params,
        };
    }

    private readonly updateDeviceQueryText = `
        UPDATE device
        SET certificate_thumbprint = $1,
            ip_address = $2,
            name = $3,
            description = $4,
            approved = $5,
            enabled = $6,
            device_group_id = $7
        WHERE id = $8
        RETURNING 
            id,
            certificate_thumbprint,
            created_at,
            ip_address,
            name,
            description,
            approved,
            enabled,
            device_group_id
    `;


    private getDeviceQueryText = `
        SELECT
            id,
            certificate_thumbprint,
            ip_address,
            name,
            description,
            created_at,
            approved,
            enabled,
            device_group_id
        FROM device
        WHERE id = $1
    `;

    public readonly getAllDevicesQueryText = `
        SELECT 
            id,
            certificate_thumbprint,
            ip_address,
            name,
            description,
            created_at,
            approved,
            enabled,
            device_group_id
        FROM device
    `;

    // private readonly getDeviceStatusQueryText = `
    //     SELECT 
    //         device_id,
    //         started,
    //         start_reason,
    //         started_at,
    //         stopped_at,
    //         total
    //     FROM device_status
    //     WHERE device_id = $1
    // `;
}
