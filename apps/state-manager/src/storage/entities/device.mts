export interface IDevice {
    id: number;
    certificate_thumbprint?: string | null;
    ip_address: string;
    name?: string | null;
    description?: string | null;
    created_at: string;
    approved: boolean;
    enabled: boolean;
    device_group_id?: number | null;
}
