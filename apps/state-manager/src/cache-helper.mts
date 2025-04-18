import { RedisCacheClient } from '@computerclubsystem/redis-client';
import { Device } from '@computerclubsystem/types/entities/device.mjs';
import { Permission } from '@computerclubsystem/types/entities/permission.mjs';
import { Tariff } from '@computerclubsystem/types/entities/tariff.mjs';

export class CacheHelper {
    private cacheClient!: RedisCacheClient;
    private cacheItemsRetentionTime!: number;
    private cacheMap = new Map<string, CachedItem>();
    private keys = {
        allTariffs: 'tariffs:all',
        allDevices: 'devices:all',
        allPermissions: 'permissions:all',
    };

    setAllPermissions(permissions: Permission[]): Promise<unknown> {
        return this.cacheClient.setValue(this.keys.allPermissions, permissions);
    }

    getAllPermissions(): Promise<Permission[] | null> {
        return this.cacheClient.getValue(this.keys.allPermissions);
    }

    setAllTariffs(tariffs: Tariff[]): Promise<unknown> {
        return this.cacheClient.setValue(this.keys.allTariffs, tariffs);
    }

    getAllTariffs(): Promise<Tariff[] | null> {
        return this.cacheClient.getValue(this.keys.allTariffs);
    }

    deleteAllTariffs(): Promise<number> {
        return this.cacheClient.deleteItem(this.keys.allTariffs);
    }

    setAllDevices(devices: Device[]): Promise<unknown> {
        return this.cacheClient.setValue(this.keys.allDevices, devices);
    }

    getAllDevices(): Promise<Device[] | null> {
        return this.cacheClient.getValue(this.keys.allDevices);
    }

    deleteAllDevices(): Promise<number> {
        return this.cacheClient.deleteItem(this.keys.allDevices);
    }

    // async getValue<TValue>(key: string): Promise<TValue> {
    //     const cachedItem = this.getCachedItem(key);
    //     if (cachedItem) {
    //         return cachedItem.item as TValue;
    //     }
    //     const value = await this.cacheClient.getValue(key);
    //     return value;
    // }

    // getCachedItem(key: string): CachedItem | undefined {
    //     const cachedItem = this.cacheMap.get(key);
    //     return cachedItem;
    //     // if (!cachedItem) {
    //     //     return undefined;
    //     // }
    //     // const now = Date.now();
    //     // const isExpired = (cachedItem.cachedAt + cachedItem.retentionTime) > now;
    //     // if (isExpired) {
    //     //     return undefined;
    //     // }
    //     // return cachedItem;
    // }

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
