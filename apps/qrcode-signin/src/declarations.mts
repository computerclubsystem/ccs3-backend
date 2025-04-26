import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';

export interface MessageStatItem {
    type: string;
    channel: ChannelName;
    correlationId?: string;
    sentAt: number;
    completedAt: number;
    error?: Error;
}
