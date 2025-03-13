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
import { DeviceContinuationQueryHelper } from './device-continuation-query-helper.mjs';
import { IDeviceContinuation } from 'src/storage/entities/device-continuation.mjs';
import { ITariffRecharge } from 'src/storage/entities/tariff-recharge.mjs';
import { TariffRechargeQueryHelper } from './tariff-recharge-query-helper.mjs';
import { ShiftQueryHelper } from './shift-query-helper.mjs';
import { IShift } from 'src/storage/entities/shift.mjs';
import { ISystemSettingNameWithValue } from 'src/storage/entities/system-setting-name-with-value.mjs';
import { ShiftDeviceStatusQueryHelper } from './shift-device-status-query-helper.mjs';
import { IShiftDeviceStatus } from 'src/storage/entities/shift-device-status.mjs';
import { ShiftDeviceContinuationQueryHelper } from './shift-device-continuation-query-helper.mjs';
import { UserProfileSettingQueryHelper } from './user-profile-setting-query-helper.mjs';
import { UserProfileQueryHelper } from './user-profile-query-helper.mjs';
import { IUserProfileSettingWithValue } from 'src/storage/entities/user-profile-setting-with-value.mjs';
import { DeviceGroupQueryHelper } from './device-group-query-helper.mjs';
import { TariffInDeviceGroupQueryHelper } from './tariff-in-device-group-query-helper.mjs';
import { IDeviceGroup } from 'src/storage/entities/device-group.mjs';

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
        deviceContinuation: new DeviceContinuationQueryHelper(),
        tariffRecharge: new TariffRechargeQueryHelper(),
        shift: new ShiftQueryHelper(),
        shiftDeviceStatus: new ShiftDeviceStatusQueryHelper(),
        shiftDeviceContinuation: new ShiftDeviceContinuationQueryHelper(),
        userProfileSetting: new UserProfileSettingQueryHelper(),
        userProfile: new UserProfileQueryHelper(),
        deviceGroup: new DeviceGroupQueryHelper(),
        tariffInDeviceGroup: new TariffInDeviceGroupQueryHelper(),
    };

    setDeviceStatusNoteQueryData(deviceIds: number[], note: string | null): IQueryTextWithParamsResult {
        return this.helpers.deviceStatus.setDeviceStatusNoteQueryData(deviceIds, note);
    }

    getAllTariffsInDeviceGroupsQueryData(): IQueryTextWithParamsResult {
        return this.helpers.tariffInDeviceGroup.getAllTariffsInDeviceGroupsQueryData();
    }
    updateDeviceGroupQueryData(deviceGroup: IDeviceGroup): IQueryTextWithParamsResult {
        return this.helpers.deviceGroup.updateDeviceGroupQueryData(deviceGroup);
    }

    replaceDeviceGroupTariffIdsQueryData(deviceGroupId: number, tariffIds: number[]): IQueryTextWithParamsResult {
        return this.helpers.tariffInDeviceGroup.replaceDeviceGroupTariffIdsQueryData(deviceGroupId, tariffIds);
    }

    createDeviceGroupQueryData(deviceGroup: IDeviceGroup): IQueryTextWithParamsResult {
        return this.helpers.deviceGroup.createDeviceGroupQueryData(deviceGroup);
    }

    getAllDeviceIdsInDeviceGroupQueryData(deviceGroupId: number): IQueryTextWithParamsResult {
        return this.helpers.device.getAllDeviceIdsInDeviceGroupQueryData(deviceGroupId);
    }

    getAllTariffIdsInDeviceGroupQueryData(deviceGroupId: number): IQueryTextWithParamsResult {
        return this.helpers.tariffInDeviceGroup.getAllTariffIdsInDeviceGroupQueryData(deviceGroupId);
    }

    getDeviceGroupQueryData(deviceGroupId: number): IQueryTextWithParamsResult {
        return this.helpers.deviceGroup.getDeviceGroupQueryData(deviceGroupId);
    }

    getAllDeviceGroupsQueryData(): IQueryTextWithParamsResult {
        return this.helpers.deviceGroup.getAllDeviceGroupsQueryData();
    }

    updateUserProfileSettingQueryData(userId: number, profileSettings: IUserProfileSettingWithValue): IQueryTextWithParamsResult {
        return this.helpers.userProfile.updateUserProfileSettingQueryData(userId, profileSettings);
    }

    getUserProfileSettingWithValuesQueryData(userId: number): IQueryTextWithParamsResult {
        return this.helpers.userProfile.getUserProfileSettingWithValuesQueryData(userId);
    }

    getAllUserProfileSettingsQueryData(): IQueryTextWithParamsResult {
        return this.helpers.userProfileSetting.getAllUserProfileSettingsQueryData();
    }

    changePasswordQueryData(userId: number, currentPasswordHash: string, newPasswordHash: string): IQueryTextWithParamsResult {
        return this.helpers.user.changePasswordQueryData(userId, currentPasswordHash, newPasswordHash);
    }

    insertAllDeviceContinuationsQueryData(shiftId: number): IQueryTextWithParamsResult {
        return this.helpers.shiftDeviceContinuation.insertAllDeviceContinuationsQueryData(shiftId);
    }

    insertAllDeviceStatusesQueryData(shiftId: number): IQueryTextWithParamsResult {
        return this.helpers.shiftDeviceStatus.insertAllDeviceStatusesQueryData(shiftId);
    }

    addShiftDeviceStatusQueryData(shiftDeviceStatus: IShiftDeviceStatus): IQueryTextWithParamsResult {
        return this.helpers.shiftDeviceStatus.addShiftDeviceStatus(shiftDeviceStatus);
    }

    getRechargedTariffsForDateTimeIntervalQueryData(fromDate: string | undefined | null, toDate: string): IQueryTextWithParamsResult {
        return this.helpers.tariffRecharge.getRechargedTariffsForDateTimeInterval(fromDate, toDate);
    }

    getCreatedTariffsForDateTimeIntervalQueryData(fromDate: string | undefined | null, toDate: string): IQueryTextWithParamsResult {
        return this.helpers.tariff.getCreatedTariffsForDateTimeInterval(fromDate, toDate);
    }

    addShiftQueryData(shift: IShift): IQueryTextWithParamsResult {
        return this.helpers.shift.addShiftQueryData(shift);
    }

    getShiftsQueryData(fromDate: string, toDate: string, userId: number | null | undefined): IQueryTextWithParamsResult {
        return this.helpers.shift.getShiftsQueryData(fromDate, toDate, userId);
    }

    getShiftsSummaryQueryData(fromDate: string, toDate: string, userId: number | null | undefined): IQueryTextWithParamsResult {
        return this.helpers.shift.getShiftsSummaryQueryData(fromDate, toDate, userId);
    }

    getDeviceSessionsQueryData(
        fromDate: string,
        toDate: string,
        userId: number | null | undefined,
        deviceId: number | null | undefined,
        tariffId: number | null | undefined,
    ): IQueryTextWithParamsResult {
        return this.helpers.deviceSession.getDeviceCompletedSessionsQueryData(fromDate, toDate, userId, deviceId, tariffId);
    }

    getCompletedSessionsQueryData(fromDate: string | null | undefined, toDate: string): IQueryTextWithParamsResult {
        return this.helpers.deviceSession.getCompletedSessionsQueryData(fromDate, toDate);
    }

    getCompletedSessionsSummaryQueryData(fromDate: string | null | undefined, toDate: string): IQueryTextWithParamsResult {
        return this.helpers.deviceSession.getCompletedSessionsSummaryQueryData(fromDate, toDate);
    }

    getLastShiftQueryData(): IQueryTextWithParamsResult {
        return this.helpers.shift.getLastShiftQueryData();
    }

    updateDeviceContinuationDeviceIdQuery(sourceDeviceId: number, targetDeviceId: number): IQueryTextWithParamsResult {
        return this.helpers.deviceContinuation.updateDeviceContinuationDeviceIdQuery(sourceDeviceId, targetDeviceId);
    }

    upsertDeviceContinuationQueryData(deviceContinuation: IDeviceContinuation): IQueryTextWithParamsResult {
        return this.helpers.deviceContinuation.upsertDeviceContinuationQuery(deviceContinuation);
    }

    deleteDeviceContinuationQueryData(deviceId: number): IQueryTextWithParamsResult {
        return this.helpers.deviceContinuation.deleteDeviceContinuationQuery(deviceId);
    }

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

    getAllTariffsQueryData(types?: number[]): IQueryTextWithParamsResult {
        return this.helpers.tariff.getAllTariffsQueryData(types);
    }

    getTariffByIdQueryData(tariffId: number): IQueryTextWithParamsResult {
        return this.helpers.tariff.getTariffByIdQueryData(tariffId);
    }

    checkTariffPasswordHashQueryData(tariffId: number, passwordHash: string): IQueryTextWithParamsResult {
        return this.helpers.tariff.checkTariffPasswordHashQueryData(tariffId, passwordHash);
    }

    createTariffQueryData(tariff: ITariff, passwordHash?: string): IQueryTextWithParamsResult {
        return this.helpers.tariff.createTariffQueryData(tariff, passwordHash);
    }

    updateTariffQueryData(tariff: ITariff, passwordHash?: string): IQueryTextWithParamsResult {
        return this.helpers.tariff.updateTariffQueryData(tariff, passwordHash);
    }

    updateTariffRemainingSeconds(tariffId: number, remainingSeconds: number): IQueryTextWithParamsResult {
        return this.helpers.tariff.updateTariffRemainingSecondsQueryData(tariffId, remainingSeconds);
    }

    updateTariffPasswordHash(tariffId: number, passwordHash: string): IQueryTextWithParamsResult {
        return this.helpers.tariff.updateTariffPasswordHashQueryData(tariffId, passwordHash);
    }

    increaseTariffRemainingSeconds(tariffId: number, secondsToAdd: number, increasedAt: string, userId: number): IQueryTextWithParamsResult {
        return this.helpers.tariff.increaseTariffRemainingSecondsQueryData(tariffId, secondsToAdd, increasedAt, userId);
    }

    addTariffRechargeQueryData(tariffRecharge: ITariffRecharge): IQueryTextWithParamsResult {
        return this.helpers.tariffRecharge.addTariffRechargeQueryData(tariffRecharge);
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

    updateSystemSettingValueQueryData(systemSettingNameWithValue: ISystemSettingNameWithValue): IQueryTextWithParamsResult {
        return this.helpers.systemSettings.updateSystemSettingValueQueryData(systemSettingNameWithValue);
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

    completeDeviceStatusUpdateQuery(deviceStatus: IDeviceStatus, deviceSession: IDeviceSession): IQueryTextWithParamsResult {
        return this.helpers.deviceStatus.completeDeviceStatusUpdateQuery(deviceStatus, deviceSession);
    }

    // setDeviceStatusEnabledFlag(deviceId: number, enabled: boolean): IQueryTextWithParamsResult {
    //     return this.helpers.deviceStatus.setDeviceStatusEnabledFlagQuery(deviceId, enabled);
    // }

    getAllDeviceStatusesQueryText(): string {
        return this.helpers.deviceStatus.getAllDeviceStatusesQueryText;
    }

    getDeviceStatusesByTariffIdQuery(tariffId: number): IQueryTextWithParamsResult {
        return this.helpers.deviceStatus.getDeviceStatusesByTariffIdQuery(tariffId);
    }

    getAllDeviceStatusesWithContinuationDataQueryText(): string {
        return this.helpers.deviceStatus.getAllDeviceStatusesWithContinuationDataQueryText;
    }
}
