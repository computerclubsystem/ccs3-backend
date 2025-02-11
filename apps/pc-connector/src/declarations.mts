import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';

export interface MessageStatItem {
    type: string;
    correlationId?: string;
    channel: ChannelName;
    sentAt: number;
    completedAt: number;
    error?: any;
    deviceId?: number | null;
}