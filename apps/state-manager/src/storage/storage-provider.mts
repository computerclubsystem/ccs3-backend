import { IDevice } from './entities/device.mjs';
import { IDeviceConnectionEvent } from './entities/device-connection-event.mjs';
import { IDeviceStatus } from './entities/device-status.mjs';
import { ISystemSetting } from './entities/system-setting.mjs';
import { IUser } from './entities/user.mjs';
import { StorageProviderConfig } from './storage-provider-config.mjs';
import { StorageProviderInitResult } from './storage-provider-init-result.mjs';
import { IOperatorConnectionEvent } from './entities/operator-connection-event.mjs';

export interface StorageProvider {
    init(config: StorageProviderConfig): Promise<StorageProviderInitResult>;
    getDeviceByCertificateThumbprint(certificateThumbprint: string): Promise<IDevice | undefined>;
    createDevice(device: IDevice): Promise<IDevice>;
    getUser(username: string, passwordHash: string): Promise<IUser | undefined>;
    getUserById(userId: number): Promise<IUser | undefined>;
    getUserPermissions(userId: number): Promise<string[] | undefined>;
    getAllDeviceStatuses(): Promise<IDeviceStatus[]>;
    getAllSystemSettings(): Promise<ISystemSetting[]>;
    getSystemSettingByName(name: string): Promise<ISystemSetting | undefined>;
    addDeviceConnectionEvent(deviceConnectionEvent: IDeviceConnectionEvent): Promise<IDeviceConnectionEvent | undefined>;
    addOperatorConnectionEvent(addOperatorConnectionEvent: IOperatorConnectionEvent): Promise<IOperatorConnectionEvent | undefined>;
}
