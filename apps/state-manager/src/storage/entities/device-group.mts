export interface IDeviceGroup {
    id: number;
    name: string;
    description?: string | null;
    enabled: boolean;
    restrict_device_transfers: boolean;
}