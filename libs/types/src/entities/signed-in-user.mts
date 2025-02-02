export interface SignedInUser {
    userId: number;
    username: string;
    token: string;
    connectedAt: number;
    tokenExpiresAt: number;
    connectionId: number;
    connectionInstanceId: string;
}
