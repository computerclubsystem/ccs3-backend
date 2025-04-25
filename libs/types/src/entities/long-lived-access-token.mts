export interface LongLivedAccessToken {
    id: number;
    token: string;
    issuedAt: string;
    validTo: string;
    userId?: number | null;
    tariffId?: number | null;
}
