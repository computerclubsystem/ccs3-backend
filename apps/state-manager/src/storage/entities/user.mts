export interface IUser {
    id: number;
    username: string;
    enabled: boolean;
    created_at: string;
    updated_at?: string | null;
}
