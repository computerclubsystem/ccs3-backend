// INSERT INTO table_name (column1, column2, ...)
// VALUES (value1, value2, ...)
// ON CONFLICT (conflict_column)
// DO NOTHING | DO UPDATE SET column1 = value1, column2 = value2, ...;

import { IDevice } from 'src/storage/entities/device.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class DeviceQueryHelper {
    createDeviceQueryData(device: IDevice): IQueryTextWithParamsResult {
        const params: unknown[] = [
            device.certificate_thumbprint,
            device.created_at,
            device.ip_address,
            device.name,
            device.description,
            device.approved,
            device.enabled,
            device.device_group_id,
            device.disable_transfer,
        ];
        return {
            text: this.createDeviceQueryText,
            params,
        }
    }

    getDeviceByCertificateThumbprintQueryData(certificateThumbprint: string): IQueryTextWithParamsResult {
        const params: unknown[] = [
            certificateThumbprint,
        ];
        return {
            text: this.getDeviceByCertificateThumbprintQueryText,
            params,
        };
    }

    updateDeviceQueryData(device: IDevice): IQueryTextWithParamsResult {
        const params = [
            device.certificate_thumbprint,
            device.ip_address,
            device.name,
            device.description,
            device.approved,
            device.enabled,
            device.device_group_id,
            device.disable_transfer,
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

    private readonly createDeviceQueryText = `
        INSERT INTO device
        (
            certificate_thumbprint,
            created_at,
            ip_address,
            name,
            description,
            approved,
            enabled,
            device_group_id,
            disable_transfer
        )
        VALUES
        (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        RETURNING 
            id,
            certificate_thumbprint,
            created_at,
            ip_address,
            name,
            description,
            approved,
            enabled,
            device_group_id,
            disable_transfer
    `;

    private readonly getDeviceByCertificateThumbprintQueryText = `
        SELECT 
            id,
            certificate_thumbprint,
            ip_address,
            name,
            description,
            created_at,
            approved,
            enabled,
            device_group_id,
            disable_transfer
        FROM device
        WHERE certificate_thumbprint = $1
        LIMIT 1
    `;

    private readonly updateDeviceQueryText = `
        UPDATE device
        SET certificate_thumbprint = $1,
            ip_address = $2,
            name = $3,
            description = $4,
            approved = $5,
            enabled = $6,
            device_group_id = $7,
            disable_transfer = $8
        WHERE id = $9
        RETURNING 
            id,
            certificate_thumbprint,
            created_at,
            ip_address,
            name,
            description,
            approved,
            enabled,
            device_group_id,
            disable_transfer
    `;


    private readonly getDeviceQueryText = `
        SELECT
            id,
            certificate_thumbprint,
            ip_address,
            name,
            description,
            created_at,
            approved,
            enabled,
            device_group_id,
            disable_transfer
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
            device_group_id,
            disable_transfer
        FROM device
    `;
}
