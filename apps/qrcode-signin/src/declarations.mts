import { ChannelName } from '@computerclubsystem/types/channels/channel-name.mjs';

export interface MessageStatItem {
    type: string;
    channel: ChannelName;
    correlationId?: string;
    sentAt: number;
    completedAt: number;
    error?: Error;
}

export interface ApiCredentialsSignInRequestBody {
    identifier: string;
    passwordHash: string;
    code: string;
}

export const enum ApiCredentialsSignInResponseBodyIdentifierType {
    user = 'user',
    customerCard = 'customer-card',
}

export interface ApiCredentialsSignInResponseBody {
    success: boolean;
    errorMessage?: string | null;
    token?: string | null;
    remainingSeconds?: number | null;
    identifier?: string | null;
    identifierType?: ApiCredentialsSignInResponseBodyIdentifierType | null;
}
