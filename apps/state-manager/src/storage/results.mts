import { IDeviceStatus } from './entities/device-status.mjs';

export interface TransferDeviceResult {
    sourceDeviceStatus: IDeviceStatus;
    targetDeviceStatus: IDeviceStatus;
}
