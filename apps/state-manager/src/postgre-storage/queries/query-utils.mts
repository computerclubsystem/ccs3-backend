import { IDevice } from 'src/storage/entities/device.mjs';
import { SystemSettingQueryUtils } from './system-setting-query-utils.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { IDeviceConnectionEvent } from 'src/storage/entities/device-connection-event.mjs';
import { DeviceConnectionQueryHelper } from './device-connection-event-query-helper.mjs';
import { IOperatorConnectionEvent } from 'src/storage/entities/operator-connection-event.mjs';
import { OperatorConnectionQueryHelper } from './operator-connection-event-query-helper.mjs';
import { DeviceStatusQueryHelper } from './device-status-query-helper.mjs';
import { DeviceQueryHelper } from './device-query-helper.mjs';
import { IDeviceStatus } from 'src/storage/entities/device-status.mjs';
import { TariffQueryHelper } from './tariff-query-helper.mjs';
import { ITariff } from 'src/storage/entities/tariff.mjs';
import { IDeviceSession } from 'src/storage/entities/device-session.mjs';
import { DeviceSessionQueryHelper } from './device-session-query-helper.mjs';
import { RoleQueryHelper } from './role-query-helper.mjs';
import { PermissionQueryHelper } from './permission-query-helper.mjs';
import { PermissionInRoleQueryHelper } from './permission-in-role-query-helper.mjs';
import { IRole } from 'src/storage/entities/role.mjs';

export class QueryUtils {
    private readonly helpers = {
        systemSettings: new SystemSettingQueryUtils(),
        deviceConnection: new DeviceConnectionQueryHelper(),
        operatorConnection: new OperatorConnectionQueryHelper(),
        deviceStatus: new DeviceStatusQueryHelper(),
        device: new DeviceQueryHelper(),
        tariff: new TariffQueryHelper(),
        deviceSession: new DeviceSessionQueryHelper(),
        role: new RoleQueryHelper(),
        permission: new PermissionQueryHelper(),
        permissionInRole: new PermissionInRoleQueryHelper(),
    };

    replaceRolePermissionsQueryData(roleId: number, permissionIds: number[]): IQueryTextWithParamsResult {
        return this.helpers.permissionInRole.replaceRolePermissionsQueryData(roleId, permissionIds);
    }

    createRoleQueryData(role: IRole): IQueryTextWithParamsResult {
        return this.helpers.role.createRoleQueryData(role);
    }

    updateRoleQueryData(role: IRole): IQueryTextWithParamsResult {
        return this.helpers.role.updateRoleQueryData(role);
    }

    getRolePermissionIdsQueryData(roleId: number): IQueryTextWithParamsResult {
        return this.helpers.permissionInRole.getRolePermissionIdsQueryData(roleId);
    }

    getAllPermissionsQueryText(): string {
        return this.helpers.permission.getAllPermissionsQueryText;
    }

    getRoleByIdQueryData(roleId: number): IQueryTextWithParamsResult {
        return this.helpers.role.getRoleByIdQueryData(roleId);
    }

    getAllRolesQueryText(): string {
        return this.helpers.role.getAllRolesQueryText;
    }

    addDeviceSessionQueryData(deviceSession: IDeviceSession): IQueryTextWithParamsResult {
        return this.helpers.deviceSession.addDeviceSessionQueryData(deviceSession);
    }

    getAllTariffsQueryText(): string {
        return this.helpers.tariff.getAllTariffsQueryText;
    }

    getTariffByIdQueryData(tariffId: number): IQueryTextWithParamsResult {
        return this.helpers.tariff.getTariffByIdQueryData(tariffId);
    }

    createTariffQueryData(tariff: ITariff): IQueryTextWithParamsResult {
        return this.helpers.tariff.createTariffQueryData(tariff);
    }

    updateTariffQueryData(tariff: ITariff): IQueryTextWithParamsResult {
        return this.helpers.tariff.updateTariffQueryData(tariff);
    }

    addOperatorConnectionEventQueryData(operatorConnectionEvent: IOperatorConnectionEvent): IQueryTextWithParamsResult {
        const queryData = this.helpers.operatorConnection.addOperatorConnectionQueryData(operatorConnectionEvent);
        return {
            text: queryData.text,
            params: queryData.params,
        };
    }

    addDeviceConnectionEventQueryData(deviceConnectionEvent: IDeviceConnectionEvent): IQueryTextWithParamsResult {
        const queryData = this.helpers.deviceConnection.addDeviceConnectionQueryData(deviceConnectionEvent);
        return {
            text: queryData.text,
            params: queryData.params,
        };
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

    getAllDevicesQueryText(): string {
        return this.helpers.device.getAllDevicesQueryText;
    }

    getDeviceQueryData(deviceId: number): IQueryTextWithParamsResult {
        return this.helpers.device.getDeviceStatusQuery(deviceId);
    }

    getSystemSettingByNameQueryData(name: string): IQueryTextWithParamsResult {
        const params: string[] = [
            name,
        ];
        return {
            text: this.helpers.systemSettings.getSystemSettingByNameQueryText,
            params,
        };
    }

    getAllSystemSettingsQuery(): string {
        return this.helpers.systemSettings.getAllSystemSettingsQueryText;
    }

    updateDeviceQueryData(device: IDevice): IQueryTextWithParamsResult {
        return this.helpers.device.updateDeviceQueryData(device);
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
            text: this.createDeviceQueryText,
            params,
        }
    }

    getUserByIdQueryData(userId: number): IQueryTextWithParamsResult {
        const params: [number] = [
            userId,
        ];
        return {
            text: this.getUserByIdQueryText,
            params,
        };
    }

    getUserQueryData(username: string, passwordHash: string): IQueryTextWithParamsResult {
        const params: unknown[] = [
            username,
            passwordHash,
        ];
        return {
            text: this.getUserQueryText,
            params,
        };
    }

    getUserPermissionsQueryData(userId: number): IQueryTextWithParamsResult {
        const params: [number] = [
            userId,
        ];
        return {
            text: this.getUserPermissionsQueryText,
            params,
        }
    }

    getDeviceStatusQuery(deviceId: number): IQueryTextWithParamsResult {
        return this.helpers.deviceStatus.getDeviceStatusQuery(deviceId);
    }

    addOrUpdateDeviceStatusEnabledQuery(deviceStatus: IDeviceStatus): IQueryTextWithParamsResult {
        return this.helpers.deviceStatus.addOrUpdateDeviceStatusEnabledQuery(deviceStatus);
    }

    updateDeviceStatusQuery(deviceStatus: IDeviceStatus): IQueryTextWithParamsResult {
        return this.helpers.deviceStatus.updateDeviceStatusQuery(deviceStatus);
    }

    // setDeviceStatusEnabledFlag(deviceId: number, enabled: boolean): IQueryTextWithParamsResult {
    //     return this.helpers.deviceStatus.setDeviceStatusEnabledFlagQuery(deviceId, enabled);
    // }

    getAllDeviceStatusesQueryText(): string {
        return this.helpers.deviceStatus.getAllDeviceStatusesQueryText;
    }

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
