export interface ILongLivedAccessTokenUsage {
    id: number;
    token: string;
    used_at: string;
    valid_to: string;
    device_id?: number | null;
    user_id?: number | null;
    tariff_id?: number | null;
    ip_address?: string | null;
}