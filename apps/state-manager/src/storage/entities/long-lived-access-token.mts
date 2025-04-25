export interface ILongLivedAccessToken {
    id: number;
    token: string;
    issued_at: string;
    valid_to: string;
    user_id?: number | null;
    tariff_id?: number | null;
}