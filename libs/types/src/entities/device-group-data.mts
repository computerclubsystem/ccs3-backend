import { DeviceGroup } from './device-group.mjs';

export interface DeviceGroupData {
    deviceGroup: DeviceGroup;
    assignedDeviceIds: number[];
    assignedTariffIds: number[];
}
