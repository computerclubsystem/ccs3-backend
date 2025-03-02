export interface DeviceSession {
    id: number;
    deviceId: number;
    tariffId: number;
    totalAmount: number;
    startedAt: string;
    stoppedAt: string;
    startedByUserId?: number | null;
    stoppedByUserId?: number | null;
    startedByCustomer?: boolean | null;
    stoppedByCustomer?: boolean | null;
    note?: string | null;
}