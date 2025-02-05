export interface Shift {
    id: number;
    userId: number;
    completedSessionsTotal: number;
    completedSessionsCount: number;
    runningSessionsTotal: number;
    runningSessionsCount: number;
    continuationsTotal: number;
    continuationsCount: number;
    totalAmount: number;
    completedAt: string;
    note?: string | null;
}
