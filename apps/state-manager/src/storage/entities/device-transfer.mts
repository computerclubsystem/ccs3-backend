export interface IDeviceTransfer {
    id: number;
    source_device_id: number;
    target_device_id: number;
    start_reason: number;
    started_at: string;
    total: number;
    started_by_user_id?: number | null;
    transferred_by_user_id?: number | null;
    source_note?: string | null;
    target_note?: string | null;
    transferred_at: string;
}