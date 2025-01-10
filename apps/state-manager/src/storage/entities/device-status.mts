export interface IDeviceStatus {
    device_id: number;
    started: boolean;
    start_reason: number | null;
    started_at: string | null;
    stopped_at: string | null;
    total: number | null;
    enabled: boolean;
    started_by_user_id?: number | null;
    stopped_by_user_id?: number | null;
}
