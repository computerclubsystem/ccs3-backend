import { IDeviceSession } from './entities/device-session.mjs';
import { IDeviceStatus } from './entities/device-status.mjs';

export interface TransferDeviceResult {
    sourceDeviceStatus: IDeviceStatus;
    targetDeviceStatus: IDeviceStatus;
}

export interface CompleteDeviceStatusUpdateResult {
    deviceStatus: IDeviceStatus;
    deviceSession: IDeviceSession;
}
