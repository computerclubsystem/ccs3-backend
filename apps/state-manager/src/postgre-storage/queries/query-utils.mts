import { IDevice } from 'src/storage/entities/device.mjs';
import { SystemSettingQueryUtils } from './system-setting-query-utils.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { IDeviceConnectionEvent } from 'src/storage/entities/device-connection-event.mjs';
import { DeviceConnectionQueryHelper } from './device-connection-event-query-helper.mjs';

export class QueryUtils {
    private readonly helpers = {
        systemSettings: new SystemSettingQueryUtils(),
        deviceConnection: new DeviceConnectionQueryHelper(),
    };

    addDeviceConnectionEventQueryData(deviceConnection: IDeviceConnectionEvent): IQueryTextWithParamsResult {
        const queryData = this.helpers.deviceConnection.addDeviceConnectionQueryData(deviceConnection);
        return {
            query: queryData.query,
            params: queryData.params,
        };
    }

    getDeviceByCertificateThumbprintQueryData(certificateThumbprint: string): IQueryTextWithParamsResult {
        const params: unknown[] = [
            certificateThumbprint,
        ];
        return {
            query: this.getDeviceByCertificateThumbprintQueryText,
            params,
        };
    }

    getSystemSettingByNameQueryData(name: string): IQueryTextWithParamsResult {
        const params: string[] = [
            name,
        ];
        return {
            query: this.helpers.systemSettings.getSystemSettingByNameQueryText,
            params,
        };
    }

    getAllSystemSettingsQuery(): string {
        return this.helpers.systemSettings.getAllSystemSettingsQueryText;
    }

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
        ];
        return {
            query: this.createDeviceQueryText,
            params,
        }
    }

    getUserQueryData(username: string, passwordHash: string): IQueryTextWithParamsResult {
        const params: unknown[] = [
            username,
            passwordHash,
        ];
        return {
            query: this.getUserQueryText,
            params,
        };
    }

    getAllDeviceStatusesQuery(): string {
        return this.getAllDeviceStatusesQueryText;
    }

    private readonly getAllDeviceStatusesQueryText = `
        SELECT
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total
        FROM device_status
    `;

    private readonly getUserQueryText = `
        SELECT 
            id,
            username,
            enabled
        FROM "user"
        WHERE username = $1 AND password_hash = $2
        LIMIT 1
    `;

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
            device_group_id
        )
        VALUES
        (
            $1, $2, $3, $4, $5, $6, $7, $8
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
            device_group_id
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
            device_group_id
        FROM device
        WHERE certificate_thumbprint = $1
        LIMIT 1
    `;
}
