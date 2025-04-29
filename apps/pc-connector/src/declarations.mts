import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';

export interface MessageStatItem {
    type: string;
    correlationId?: string;
    channel: ChannelName;
    sentAt: number;
    completedAt: number;
    error?: Error;
    deviceId?: number | null;
}

export interface CodeSignIn {
    connectionInstanceId: string;
    code: string;
    createdAt: number;
}
