export interface IDeviceSession {
    id: number;
    device_id: number;
    tariff_id: number;
    total_amount: number;
    started_at: string;
    stopped_at: string;
    started_by_user_id?: number | null;
    stopped_by_user_id?: number | null;
    started_by_customer?: boolean | null;
    stopped_by_customer?: boolean | null;
    note?: string | null;
}