import { IDevice } from 'src/storage/entities/device.mjs';
import { SystemSettingQueryUtils } from './system-setting-query-utils.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { IDeviceConnectionEvent } from 'src/storage/entities/device-connection-event.mjs';
import { DeviceConnectionQueryHelper } from './device-connection-event-query-helper.mjs';
import { IOperatorConnectionEvent } from 'src/storage/entities/operator-connection-event.mjs';
import { OperatorConnectionQueryHelper } from './operator-connection-event-query-helper.mjs';

export class QueryUtils {
    private readonly helpers = {
        systemSettings: new SystemSettingQueryUtils(),
        deviceConnection: new DeviceConnectionQueryHelper(),
        operatorConnection: new OperatorConnectionQueryHelper(),
    };

    addOperatorConnectionEventQueryData(operatorConnectionEvent: IOperatorConnectionEvent): IQueryTextWithParamsResult {
        const queryData = this.helpers.operatorConnection.addOperatorConnectionQueryData(operatorConnectionEvent);
        return {
            query: queryData.query,
            params: queryData.params,
        };
    }

    addDeviceConnectionEventQueryData(deviceConnectionEvent: IDeviceConnectionEvent): IQueryTextWithParamsResult {
        const queryData = this.helpers.deviceConnection.addDeviceConnectionQueryData(deviceConnectionEvent);
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

    getUserByIdQueryData(userId: number): IQueryTextWithParamsResult {
        const params: [number] = [
            userId,
        ];
        return {
            query: this.getUserByIdQueryText,
            params,
        };
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

    getUserPermissionsQueryData(userId: number): IQueryTextWithParamsResult {
        const params: [number] = [
            userId,
        ];
        return {
            query: this.getUserPermissionsQueryText,
            params,
        }
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

    private readonly getUserPermissionsQueryText = `
        SELECT p.name 
        FROM permission_in_role AS pir
        INNER JOIN role AS r ON r.id = pir.role_id
        INNER JOIN permission AS p ON p.id = pir.permission_id
        INNER JOIN user_in_role AS uir ON uir.role_id = r.id
        INNER JOIN "user" AS u ON u.id = pir.role_id
        WHERE u.id = $1
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

    private readonly getUserByIdQueryText = `
    SELECT 
        id,
        username,
        enabled
    FROM "user"
    WHERE id = $1
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
