export interface MessageStatItem {
    type: string;
    correlationId?: string;
    sentAt: number;
    completedAt: number;
    error?: any;
    deviceId?: number | null;
}