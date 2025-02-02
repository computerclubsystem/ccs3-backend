import { RedisClient } from './declarations.mjs';
import { CreateConnectedRedisClientOptions, createConnectedRedisClient } from './client-utils.mjs';

export class RedisCacheClient {
    #client!: RedisClient;

    async scanForKeysByPattern(keyPattern: string): Promise<string[]> {
        const keys: string[] = [];
        let scanResult = await this.#client.scan(0, { MATCH: keyPattern });
        keys.push(...scanResult.keys);
        while (scanResult.cursor > 0) {
            scanResult = await this.#client.scan(scanResult.cursor, { MATCH: keyPattern });
            keys.push(...scanResult.keys);
        }
        return keys;
    }

    async getKeys(pattern: string): Promise<string[]> {
        const keys = await this.#client.keys(pattern);
        return keys;
    }

    async connect(options: CreateConnectedRedisClientOptions): Promise<void> {
        this.#client = await createConnectedRedisClient(options);
    }

    async setValue(key: string, value: any): Promise<any> {
        return this.#client.set(key, JSON.stringify(value));
    }

    async deleteItem(key: string): Promise<number> {
        return this.#client.del(key);
    }

    async getValue(key: string): Promise<any> {
        const value = await this.#client.get(key);
        if (value === null) {
            return null;
        }
        return JSON.parse(value);
    }

    async disconnect(): Promise<void> {
        return this.#client.disconnect();
    }
}
