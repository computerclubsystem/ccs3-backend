import { IDeviceStatus } from './device-status.mjs';

export interface IShiftDeviceStatus extends IDeviceStatus {
    id: number;
    shift_id: number;
}
