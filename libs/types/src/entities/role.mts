export interface Role {
    id: number;
    name: string;
    description?: string | null;
    enabled: boolean;
}