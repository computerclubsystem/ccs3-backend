export interface Device {
    id: number;
    certificateThumbprint?: string | null;
    ipAddress: string;
    name?: string | null;
    description?: string | null;
    createdAt: string;
    approved: boolean;
    enabled: boolean;
    deviceGroupId?: number | null;
    disableTransfer?: boolean | null;
}
