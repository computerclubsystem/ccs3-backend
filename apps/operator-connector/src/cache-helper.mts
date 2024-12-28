import { RedisCacheClient } from '@computerclubsystem/redis-client';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';

export class CacheHelper {
    private cacheClient!: RedisCacheClient;
    private cacheItemsRetentionTime!: number;
    private cacheMap = new Map<string, CachedItem>();

    getAuthTokenKey(token: string): string {
        return `user-auth-token:${token}`;
    }

    async getAuthTokenValue(token: string): Promise<UserAuthDataCacheValue> {
        const key = this.getAuthTokenKey(token);
        return this.getValue(key);
    }

    async setAuthTokenValue(value: UserAuthDataCacheValue): Promise<any> {
        const key = this.getAuthTokenKey(value.token);
        return this.cacheClient.setValue(key, value);
    }

    async deleteAuthTokenKey(token: string): Promise<number> {
        const key = this.getAuthTokenKey(token);
        return this.cacheClient.deleteItem(key);
    }

    getUserAuthDataKey(userId: number, connectionInstanceId: string): string {
        return `user-auth-data:${userId}:${connectionInstanceId}`;
    }

    async getUserAuthDataValue<TValue>(userId: number, connectionInstanceId: string): Promise<TValue> {
        const key = this.getUserAuthDataKey(userId, connectionInstanceId);
        return this.getValue(key);
    }

    async setUserAuthData(value: UserAuthDataCacheValue): Promise<any> {
        const key = this.getUserAuthDataKey(value.userId, value.roundtripData.connectionInstanceId);
        return this.cacheClient.setValue(key, value);
    }

    async deleteUserAuthDataKey(userId: number, connectionInstanceId: string): Promise<any> {
        const key = this.getUserAuthDataKey(userId, connectionInstanceId);
        return this.cacheClient.deleteItem(key);
    }

    async getValue<TValue>(key: string): Promise<TValue> {
        const cachedItem = this.getCachedItem(key);
        if (cachedItem) {
            return cachedItem.item as TValue;
        }
        const value = await this.cacheClient.getValue(key);
        return value;
    }

    getCachedItem(key: string): CachedItem | undefined {
        const cachedItem = this.cacheMap.get(key);
        return cachedItem;
        // if (!cachedItem) {
        //     return undefined;
        // }
        // const now = Date.now();
        // const isExpired = (cachedItem.cachedAt + cachedItem.retentionTime) > now;
        // if (isExpired) {
        //     return undefined;
        // }
        // return cachedItem;
    }

    initialize(cacheClient: RedisCacheClient): void {
        this.cacheClient = cacheClient;
    }

    // initialize(cacheClient: RedisCacheClient, cacheItemsRetentionTime: number): void {
    //     this.cacheClient = cacheClient;
    //     this.cacheItemsRetentionTime = cacheItemsRetentionTime;
    // }
}

export interface CachedItem {
    cachedAt: number;
    item: unknown;
    expiresAt: number;
}

export interface UserAuthDataCacheValue {
    userId: number;
    roundtripData: OperatorConnectionRoundTripData;
    permissions: string[];
    setAt: number;
    token: string;
    tokenExpiresAt: number;
}