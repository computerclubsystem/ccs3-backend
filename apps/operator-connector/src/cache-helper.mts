import { RedisCacheClient } from '@computerclubsystem/redis-client';
import { OperatorConnectionRoundTripData } from '@computerclubsystem/types/messages/operators/declarations/operator-connection-roundtrip-data.mjs';
import { PermissionName } from '@computerclubsystem/types/entities/declarations/permission-name.mjs';
import { CodeSignIn } from './declarations.mjs';

export class CacheHelper {
    private cacheClient!: RedisCacheClient;
    private cacheItemsRetentionTime!: number;
    private cacheMap = new Map<string, CachedItem>();
    private prefixes = {
        userAuthToken: 'user-auth-token:',
        userAuthData: 'user-auth-data:',
        codeSignIn: 'operator-connector:code-sign-in:',
    };

    async getAllCodeSignInKeys(): Promise<string[]> {
        const keyPattern = `${this.prefixes.codeSignIn}*`;
        const allKeys = await this.cacheClient.scanForKeysByPattern(keyPattern);
        return allKeys;
    }

    getCodeSignInKey(code: string): string {
        const key = `${this.prefixes.codeSignIn}${code}`;
        return key;
    }

    async setCodeSignIn(codeSignIn: CodeSignIn): Promise<unknown> {
        const key = this.getCodeSignInKey(codeSignIn.code);
        const result = await this.cacheClient.setValue(key, codeSignIn);
        return result;
    }

    async getCodeSignIn(code: string): Promise<CodeSignIn | null> {
        const key = this.getCodeSignInKey(code);
        const result: CodeSignIn | null = await this.getValue(key);
        return result;
    }

    async deleteCodeSignIn(code: string): Promise<number> {
        const key = this.getCodeSignInKey(code);
        const result = this.cacheClient.deleteItem(key);
        return result;
    }

    async getUserAllAuthDataKeys(userId: number): Promise<string[]> {
        const keyPattern = `${this.prefixes.userAuthData}${userId}:*`;
        const allKeys = await this.cacheClient.scanForKeysByPattern(keyPattern);
        return allKeys;
    }

    async getUserAllAuthData(userId: number): Promise<UserAuthDataCacheValue[]> {
        const result: UserAuthDataCacheValue[] = [];
        const keyPattern = `${this.prefixes.userAuthData}${userId}:*`;
        const allKeys = await this.cacheClient.scanForKeysByPattern(keyPattern);
        for (const key of allKeys) {
            const item: UserAuthDataCacheValue | null = await this.getValue(key);
            if (item) {
                result.push(item);
            }
        }
        return result;
    }

    async getAllUsersAuthData(): Promise<UserAuthDataCacheValue[]> {
        const result: UserAuthDataCacheValue[] = [];
        const allKeys = await this.cacheClient.scanForKeysByPattern(`${this.prefixes.userAuthData}*`);
        for (const key of allKeys) {
            const item: UserAuthDataCacheValue | null = await this.getValue(key);
            if (item) {
                result.push(item);
            }
        }
        return result;
    }

    getUserAuthTokenKey(token: string): string {
        return `${this.prefixes.userAuthToken}${token}`;
    }

    async getAuthTokenValue(token: string): Promise<UserAuthDataCacheValue | null> {
        const key = this.getUserAuthTokenKey(token);
        return this.getValue(key);
    }

    async setAuthTokenValue(value: UserAuthDataCacheValue): Promise<unknown> {
        const key = this.getUserAuthTokenKey(value.token);
        return this.cacheClient.setValue(key, value);
    }

    async deleteAuthTokenKey(token: string): Promise<number> {
        const key = this.getUserAuthTokenKey(token);
        return this.cacheClient.deleteItem(key);
    }

    getUserAuthDataKey(userId: number, connectionInstanceId: string): string {
        return `${this.prefixes.userAuthData}${userId}:${connectionInstanceId}`;
    }

    async getUserAuthDataValue<TValue>(userId: number, connectionInstanceId: string): Promise<TValue | null> {
        const key = this.getUserAuthDataKey(userId, connectionInstanceId);
        return this.getValue(key);
    }

    async setUserAuthData(value: UserAuthDataCacheValue): Promise<unknown> {
        const key = this.getUserAuthDataKey(value.userId, value.roundtripData.connectionInstanceId);
        return this.cacheClient.setValue(key, value);
    }

    async deleteUserAuthDataKey(userId: number, connectionInstanceId: string): Promise<unknown> {
        const key = this.getUserAuthDataKey(userId, connectionInstanceId);
        return this.cacheClient.deleteItem(key);
    }

    async deleteKey(key: string): Promise<number> {
        const result = this.cacheClient.deleteItem(key);
        return result;
    }

    async getValue<TValue>(key: string): Promise<TValue | null> {
        const cachedItem = this.getCachedItem(key);
        if (cachedItem) {
            return cachedItem.item as TValue;
        }
        const value = await this.cacheClient.getValue(key);
        return value as (TValue | null);
    }

    async setValue(key: string, value: unknown): Promise<unknown> {
        return this.cacheClient.setValue(key, value);
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
    username: string;
    roundtripData: OperatorConnectionRoundTripData;
    permissions: PermissionName[];
    setAt: number;
    token: string;
    tokenExpiresAt: number;
    connectedAt: number;
}