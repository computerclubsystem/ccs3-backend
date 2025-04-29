import { RedisCacheClient } from '@computerclubsystem/redis-client';
import { Device } from '@computerclubsystem/types/entities/device.mjs';
import { CodeSignIn } from './declarations.mjs';

export class CacheHelper {
    private cacheClient!: RedisCacheClient;
    private cacheItemsRetentionTime!: number;
    private cacheMap = new Map<string, CachedItem>();
    private keys = {
        allDevices: 'devices:all',
    };
    private prefixes = {
        codeSignIn: 'pc-connector:code-sign-in:',
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

    getAllDevices(): Promise<Device[]> {
        return this.cacheClient.getValue(this.keys.allDevices) as Promise<Device[]>;
    }

    async deleteKey(key: string): Promise<number> {
        const result = this.cacheClient.deleteItem(key);
        return result;
    }

    async getValue<TValue>(key: string): Promise<TValue> {
        const cachedItem = this.getCachedItem(key);
        if (cachedItem) {
            return cachedItem.item as TValue;
        }
        const value = await this.cacheClient.getValue(key);
        return value as TValue;
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

