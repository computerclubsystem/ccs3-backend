export interface OperatorDeviceStatus {
    deviceId: number;
    started: boolean;
    tariff?: number | null;
    totalSum?: number | null;
    totalTime?: number | null;
    startedAt?: number | null;
    stoppedAt?: number | null;
    expectedEndAt?: number | null;
    remainingSeconds?: number | null;
    enabled: boolean;
    continuationTariffId?: number | null;
    note?: string | null,
}
