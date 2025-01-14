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
import { UserQueryHelper } from './user-query-helper.mjs';
import { IUser } from 'src/storage/entities/user.mjs';

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
        user: new UserQueryHelper(),
    };

    replaceUserRolesQueryData(userId: number, roleIds: number[]): IQueryTextWithParamsResult {
        return this.helpers.user.replaceUserRolesQueryData(userId, roleIds);
    }

    updateUserQueryData(user: IUser, passwordHash?: string): IQueryTextWithParamsResult {
        return this.helpers.user.updateUserQueryData(user, passwordHash);
    }

    createUserQueryData(user: IUser, passwordHash: string): IQueryTextWithParamsResult {
        return this.helpers.user.createUserQueryData(user, passwordHash);
    }

    getUserRoleIdsQueryData(userId: number): IQueryTextWithParamsResult {
        return this.helpers.user.getUserRoleIdsQueryData(userId);
    }

    getAllUsersQueryText(): string {
        return this.helpers.user.getAllUsersQueryText;
    }

    getUserPermissionsQueryData(userId: number): IQueryTextWithParamsResult {
        return this.helpers.user.getUserPermissionsQueryData(userId);
    }

    getUserByIdQueryData(userId: number): IQueryTextWithParamsResult {
        return this.helpers.user.getUserByIdQueryData(userId);
    }

    getUserByUsernameAndPasswordHashQueryData(username: string, passwordHash: string): IQueryTextWithParamsResult {
        return this.helpers.user.getUserByUsernameAndPasswordHashQueryData(username, passwordHash);
    }

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

    createDeviceQueryData(device: IDevice): IQueryTextWithParamsResult {
        return this.helpers.device.createDeviceQueryData(device);
    }

    getAllDevicesQueryText(): string {
        return this.helpers.device.getAllDevicesQueryText;
    }

    getDeviceQueryData(deviceId: number): IQueryTextWithParamsResult {
        return this.helpers.device.getDeviceStatusQuery(deviceId);
    }

    getDeviceByCertificateThumbprintQueryData(certificateThumbprint: string): IQueryTextWithParamsResult {
        return this.helpers.device.getDeviceByCertificateThumbprintQueryData(certificateThumbprint);
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
}
