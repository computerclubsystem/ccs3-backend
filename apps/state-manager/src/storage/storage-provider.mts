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
import { CompleteDeviceStatusUpdateResult, ICompletedSessionsSummary, ICurrentContinuationsSummary, ICurrentSessionsSummary, IncreaseTariffRemainingSecondsResult, ITariffRechargesSummary, TransferDeviceResult } from './results.mjs';
import { IDeviceContinuation } from './entities/device-continuation.mjs';
import { IShift } from './entities/shift.mjs';
import { ITariffRecharge } from './entities/tariff-recharge.mjs';

export interface StorageProvider {
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
    getAllDeviceStatuses(): Promise<IDeviceStatus[]>;
    getDeviceStatusesByTariffId(tariffId: number): Promise<IDeviceStatus[]>;
    getAllDeviceStatusesWithContinuationData(): Promise<IDeviceStatusWithContinuationData[]>;
    addOrUpdateDeviceStatusEnabled(deviceStatus: IDeviceStatus): Promise<IDeviceStatus | undefined>;
    updateDeviceStatus(deviceStatus: IDeviceStatus): Promise<void>;
    transferDevice(sourceDeviceId: number, targetDeviceId: number, userId: number): Promise<TransferDeviceResult | undefined>;
    // Updates device status, adds device session and clears device continuation if any
    completeDeviceStatusUpdate(storageDeviceStatus: IDeviceStatusWithContinuationData, storageDeviceSession: IDeviceSession): Promise<CompleteDeviceStatusUpdateResult | undefined>;
    createDeviceContinuation(deviceContinuation: IDeviceContinuation): Promise<IDeviceContinuation>;
    deleteDeviceContinuation(deviceId: number): Promise<void>;

    // Shift
    getLastShift(): Promise<IShift | undefined>;
    getCompletedSessionsSummary(fromDate: string | null | undefined, toDate: string): Promise<ICompletedSessionsSummary>;
    addShift(shift: IShift): Promise<IShift>;

    getAllSystemSettings(): Promise<ISystemSetting[]>;
    getSystemSettingByName(name: string): Promise<ISystemSetting | undefined>;

    addOperatorConnectionEvent(addOperatorConnectionEvent: IOperatorConnectionEvent): Promise<IOperatorConnectionEvent | undefined>;

    getAllTariffs(types?: number[]): Promise<ITariff[]>;
    getTariffById(tariffId: number): Promise<ITariff | undefined>;
    checkTariffPasswordHash(tariffId: number, passwordHash: string): Promise<boolean>;
    createTariff(tariff: ITariff, passwordHash?: string): Promise<ITariff>;
    updateTariff(tariff: ITariff, passwordHash?: string): Promise<ITariff>;
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
