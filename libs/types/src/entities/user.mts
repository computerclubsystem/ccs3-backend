export interface User {
    id: number;
    username: string;
    enabled: boolean;
    createdAt: string;
    updatedAt?: string | null;
}