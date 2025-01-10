import { IDevice } from './entities/device.mjs';
import { IDeviceConnectionEvent } from './entities/device-connection-event.mjs';
import { IDeviceStatus } from './entities/device-status.mjs';
import { ISystemSetting } from './entities/system-setting.mjs';
import { IUser } from './entities/user.mjs';
import { StorageProviderConfig } from './storage-provider-config.mjs';
import { StorageProviderInitResult } from './storage-provider-init-result.mjs';
import { IOperatorConnectionEvent } from './entities/operator-connection-event.mjs';
import { ITariff } from './entities/tariff.mjs';

export interface StorageProvider {
    init(config: StorageProviderConfig): Promise<StorageProviderInitResult>;
    stop(): Promise<void>;
    getDeviceByCertificateThumbprint(certificateThumbprint: string): Promise<IDevice | undefined>;
    createDevice(device: IDevice): Promise<IDevice>;
    updateDevice(device: IDevice): Promise<IDevice>;
    getAllDevices(): Promise<IDevice[]>;
    getDeviceById(deviceId: number): Promise<IDevice | undefined>;
    getUser(username: string, passwordHash: string): Promise<IUser | undefined>;
    getUserById(userId: number): Promise<IUser | undefined>;
    getUserPermissions(userId: number): Promise<string[] | undefined>;
    getDeviceStatus(deviceId: number): Promise<IDeviceStatus | undefined>;
    getAllDeviceStatuses(): Promise<IDeviceStatus[]>;
    addOrUpdateDeviceStatusEnabled(deviceStatus: IDeviceStatus): Promise<IDeviceStatus | undefined>;
    updateDeviceStatus(deviceStatus: IDeviceStatus): Promise<void>;
    // setDeviceStatusEnabledFlag(deviceId: number, enabled: boolean): Promise<void>;
    getAllSystemSettings(): Promise<ISystemSetting[]>;
    getSystemSettingByName(name: string): Promise<ISystemSetting | undefined>;
    addDeviceConnectionEvent(deviceConnectionEvent: IDeviceConnectionEvent): Promise<IDeviceConnectionEvent | undefined>;
    addOperatorConnectionEvent(addOperatorConnectionEvent: IOperatorConnectionEvent): Promise<IOperatorConnectionEvent | undefined>;
    getAllTariffs(): Promise<ITariff[]>;
    getTariffById(tariffId: number): Promise<ITariff | undefined>;
    createTariff(tariff: ITariff): Promise<ITariff>;
    updateTariff(tariff: ITariff): Promise<ITariff>;
}
