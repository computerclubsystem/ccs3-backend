export interface Device {
    id: number;
    certificateThumbprint: string;
    ipAddress: string;
    name?: string;
    description?: string;
    createdAt: string;
    approved: boolean;
    enabled: boolean;
    deviceGroupId?: number;
}
