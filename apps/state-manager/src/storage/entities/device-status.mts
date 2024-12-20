export interface IDeviceStatus {
    device_id: number;
    started: boolean;
    start_reason: number;
    started_at?: string;
    stopped_at?: string;
    total?: number;
}
