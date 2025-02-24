export interface DeviceGroup {
    id: number;
    name: string;
    description?: string | null;
    enabled: boolean;
    restrictDeviceTransfers: boolean;
}