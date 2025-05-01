import { IDevice } from './entities/device.mjs';
import { IDeviceConnectionEvent } from './entities/device-connection-event.mjs';
import { IDeviceStatus, IDeviceStatusWithContinuationData } from './entities/device-status.mjs';
import { ISystemSetting } from './entities/system-setting.mjs';
import { IUser } from './entities/user.mjs';
import { StorageProviderConfig } from './storage-provider-config.mjs';
import { StorageProviderInitResult } from './storage-provider-init-result.mjs';
import { IOperatorConnectionEvent } from './entities/operator-connection-event.mjs';
import { ITariff } from './entities/tariff.mjs';
import { IDeviceSession } from './entities/device-session.mjs';
import { IRole } from './entities/role.mjs';
import { IPermission } from './entities/permission.mjs';
import {
    CompleteDeviceStatusUpdateResult, ICompletedSessionsSummary, IncreaseTariffRemainingSecondsResult,
    TransferDeviceResult
} from './results.mjs';
import { IDeviceContinuation } from './entities/device-continuation.mjs';
import { IShift } from './entities/shift.mjs';
import { ITariffRecharge } from './entities/tariff-recharge.mjs';
import { IShiftsSummary } from './entities/shifts-summary.mjs';
import { ISystemSettingNameWithValue } from './entities/system-setting-name-with-value.mjs';
import { IUserProfileSetting } from './entities/user-profile-setting.mjs';
import { IUserProfileSettingWithValue } from './entities/user-profile-setting-with-value.mjs';
import { IDeviceGroup } from './entities/device-group.mjs';
import { ITariffInDeviceGroup } from './entities/tariff-in-device-group.mjs';
import { ILongLivedAccessToken } from './entities/long-lived-access-token.mjs';
import { ILongLivedAccessTokenUsage } from './entities/long-lived-access-token-usage.mjs';

export interface StorageProvider {
    updateUserPasswordHash(userId: number, passwordHash: string): Promise<boolean>;
    addLongLivedAccessTokenUsage(longLivedAccessTokenUsage: ILongLivedAccessTokenUsage): Promise<ILongLivedAccessTokenUsage | undefined>;
    getLongLivedAccessToken(token: string): Promise<ILongLivedAccessToken | undefined>;
    setLongLivedAccessToken(longLivedToken: ILongLivedAccessToken): Promise<ILongLivedAccessToken | undefined>;
    getTariffDeviceGroups(tariffId: number): Promise<number[]>;
    // setTariffDeviceGroups(tariffId: number, deviceGroupIds: number[]): Promise<void>;
    getAllTariffsInDeviceGroups(): Promise<ITariffInDeviceGroup[]>;
    updateDeviceGroup(deviceGroup: IDeviceGroup, assignedTariffIds: number[] | undefined | null): Promise<IDeviceGroup | undefined>;
    createDeviceGroup(deviceGroup: IDeviceGroup, assignedTariffIds: number[] | undefined | null): Promise<IDeviceGroup | undefined>;
    getAllDeviceIdsInDeviceGroup(deviceGroupId: number): Promise<number[]>;
    getAllTariffIdsInDeviceGroup(deviceGroupId: number): Promise<number[]>;
    getDeviceGroup(deviceGroupId: number): Promise<IDeviceGroup | undefined>;
    getAllDeviceGroups(): Promise<IDeviceGroup[]>;
    updateUserProfileSettings(userId: number, profileSettings: IUserProfileSettingWithValue[]): Promise<void>;
    getUserProfileSettingWithValues(userId: number): Promise<IUserProfileSettingWithValue[]>;
    getAllUserProfileSettings(): Promise<IUserProfileSetting[]>;
    changePassword(userId: number, currentPasswordHash: string, newPasswordHash: string): Promise<boolean>;
    getAllUsers(): Promise<IUser[]>;
    getUserByUsernameAndPasswordHash(username: string, passwordHash: string): Promise<IUser | undefined>;
    getUserById(userId: number): Promise<IUser | undefined>;
    getUserPermissions(userId: number): Promise<string[] | undefined>;
    getUserRoleIds(userId: number): Promise<number[]>;
    createUserWithRoles(user: IUser, passwordHash: string, roleIds: number[]): Promise<IUser | undefined>;
    updateUserWithRoles(user: IUser, roleIds: number[], passwordHash?: string): Promise<IUser | undefined>;

    getDeviceByCertificateThumbprint(certificateThumbprint: string): Promise<IDevice | undefined>;
    createDevice(device: IDevice): Promise<IDevice>;
    updateDevice(device: IDevice): Promise<IDevice>;
    getAllDevices(): Promise<IDevice[]>;
    getDeviceById(deviceId: number): Promise<IDevice | undefined>;
    getDeviceStatus(deviceId: number): Promise<IDeviceStatus | undefined>;
    addDeviceConnectionEvent(deviceConnectionEvent: IDeviceConnectionEvent): Promise<IDeviceConnectionEvent | undefined>;
    addDeviceSession(deviceSession: IDeviceSession): Promise<IDeviceSession>
    getDeviceSessions(fromDate: string, toDate: string, userId: number | null | undefined, deviceId: number | null | undefined, tariffId: number | null | undefined): Promise<IDeviceSession[]>
    getAllDeviceStatuses(): Promise<IDeviceStatus[]>;
    getDeviceStatusesByTariffId(tariffId: number): Promise<IDeviceStatus[]>;
    getAllDeviceStatusesWithContinuationData(): Promise<IDeviceStatusWithContinuationData[]>;
    addOrUpdateDeviceStatusEnabled(deviceStatus: IDeviceStatus): Promise<IDeviceStatus | undefined>;
    updateDeviceStatus(deviceStatus: IDeviceStatus): Promise<void>;
    transferDevice(sourceDeviceId: number, targetDeviceId: number, userId: number, transferNote: boolean | undefined | null, transferredAt: string): Promise<TransferDeviceResult | undefined>;
    setDeviceStatusNote(deviceIds: number[], note: string | null): Promise<void>;
    // Updates device status, adds device session and clears device continuation if any
    completeDeviceStatusUpdate(storageDeviceStatus: IDeviceStatusWithContinuationData, storageDeviceSession: IDeviceSession): Promise<CompleteDeviceStatusUpdateResult | undefined>;
    createDeviceContinuation(deviceContinuation: IDeviceContinuation): Promise<IDeviceContinuation>;
    deleteDeviceContinuation(deviceId: number): Promise<void>;

    // Shift
    getLastShift(): Promise<IShift | undefined>;
    getCompletedSessionsSummary(fromDate: string | null | undefined, toDate: string): Promise<ICompletedSessionsSummary>;
    addShift(shift: IShift): Promise<IShift | undefined>;
    getShifts(fromDate: string, toDate: string, userId: number | null | undefined): Promise<IShift[]>;
    getShiftsSummary(fromDate: string, toDate: string, userId: number | null | undefined): Promise<IShiftsSummary>;

    updateSystemSettingsValues(systemSettingsNamesWithValues: ISystemSettingNameWithValue[]): Promise<void>;
    getAllSystemSettings(): Promise<ISystemSetting[]>;
    getSystemSettingByName(name: string): Promise<ISystemSetting | undefined>;

    addOperatorConnectionEvent(addOperatorConnectionEvent: IOperatorConnectionEvent): Promise<IOperatorConnectionEvent | undefined>;

    getAllTariffs(types?: number[]): Promise<ITariff[]>;
    getTariffById(tariffId: number): Promise<ITariff | undefined>;
    checkTariffPasswordHash(tariffId: number, passwordHash: string): Promise<boolean>;
    createTariff(tariff: ITariff, passwordHash: string | undefined | null, deviceGroupIds: number[] | undefined | null): Promise<ITariff | undefined>;
    updateTariff(tariff: ITariff, passwordHash: string | undefined | null, deviceGroupIds: number[] | undefined | null): Promise<ITariff | undefined>;
    updateTariffRemainingSeconds(tariffId: number, remainingSeconds: number): Promise<ITariff | undefined>;
    increaseTariffRemainingSeconds(tariffId: number, secondsToAdd: number, userId: number, increasedAt: string): Promise<IncreaseTariffRemainingSecondsResult | undefined>;
    updateTariffPasswordHash(tariffId: number, passwordHash: string): Promise<ITariff | undefined>;
    getCreatedTariffsForDateTimeInterval(fromDate: string | undefined | null, toDate: string): Promise<ITariff[]>;
    getRechargedTariffsForDateTimeInterval(fromDate: string | undefined | null, toDate: string): Promise<ITariffRecharge[]>;

    getAllRoles(): Promise<IRole[]>;
    getRoleById(roleId: number): Promise<IRole | undefined>;
    getAllPermissions(): Promise<IPermission[]>
    getRolePermissionIds(roleId: number): Promise<number[]>;
    createRoleWithPermissions(role: IRole, permissionIds: number[]): Promise<IRole | undefined>;
    updateRoleWithPermissions(role: IRole, permissionIds: number[]): Promise<IRole | undefined>;

    init(config: StorageProviderConfig): Promise<StorageProviderInitResult>;
    stop(): Promise<void>;
}
