export class EnvironmentVariablesHelper {
    getObjectValueByKey(obj: object, key: string): unknown {
        return (obj as never)?.[key];
    }

    setObjectValueByKey(obj: object, key: string, value: unknown): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (obj as any)[key] = value;
    }

    createEnvironmentVars(): EnvironmentVarsData {
        // The object keys must be the same as environment variable names
        const result: EnvironmentVarsData = {
            CCS3_STATE_MANAGER_STORAGE_CONNECTION_STRING: {} as EnvironmentVariableNameWithValue<string>,
            CCS3_STATE_MANAGER_STORAGE_PROVIDER_DATABASE_MIGRATION_SCRIPTS_DIRECTORY: {} as EnvironmentVariableNameWithValue<string>,
            CCS3_REDIS_HOST: {} as EnvironmentVariableNameWithValue<string>,
            CCS3_REDIS_PORT: {} as EnvironmentVariableNameWithValue<number>,
        };
        Object.keys(result).forEach(key => this.setObjectValueByKey(result, key, { name: key } as EnvironmentVariableNameWithValue<unknown>));
        result.CCS3_STATE_MANAGER_STORAGE_CONNECTION_STRING.value = this.getEnvVarValue(result.CCS3_STATE_MANAGER_STORAGE_CONNECTION_STRING.name)!;
        result.CCS3_STATE_MANAGER_STORAGE_PROVIDER_DATABASE_MIGRATION_SCRIPTS_DIRECTORY.value = this.getEnvVarValue(result.CCS3_STATE_MANAGER_STORAGE_PROVIDER_DATABASE_MIGRATION_SCRIPTS_DIRECTORY.name, './postgre-storage/database-migrations')!;
        result.CCS3_REDIS_HOST.value = this.getEnvVarValue(result.CCS3_REDIS_HOST.name, 'ccs3-valkey-service')!;
        result.CCS3_REDIS_PORT.value = this.getEnvironmentVarValueAsNumber(result.CCS3_REDIS_PORT.name, 6379);
        return result;
    }

    getEnvironmentVarValueAsNumber(envVar: string, defaultValue: number): number {
        const stringVal = this.getEnvVarValue(envVar);
        const numberVal = stringVal && parseInt(stringVal) || defaultValue;
        return numberVal;
    }

    getEnvironmentVarValueAsBoolean(envVar: string, defaultValue: boolean): boolean {
        const stringVal = this.getEnvVarValue(envVar)?.trim();
        if (!stringVal) {
            return defaultValue;
        }
        const lowercased = stringVal.toLowerCase();
        const booleanVal = lowercased === 'true' || lowercased === 'yes';
        return booleanVal;
    }

    getEnvVarValue(envVarName: string, defaultValue?: string): string | undefined {
        return process.env[envVarName] || defaultValue;
    }
}

export interface EnvironmentVariableNameWithValue<TValue> {
    name: string;
    value: TValue;
}

export interface EnvironmentVarsData {
    /**
     * Database connection string. Must point to the application database and contain its owner credentials
     */
    CCS3_STATE_MANAGER_STORAGE_CONNECTION_STRING: EnvironmentVariableNameWithValue<string>,
    /**
     * Reserved for future use. Database connection with admin credentials. Can be used in the future to create the application database and its user automatically
     */
    // CCS3_STATE_MANAGER_STORAGE_ADMIN_CONNECTION_STRING: EnvironmentVariableNameWithValue<string>,
    /**
   * The path to the directory that contains database migration scripts used to update the database schema if needed.
   */
    CCS3_STATE_MANAGER_STORAGE_PROVIDER_DATABASE_MIGRATION_SCRIPTS_DIRECTORY: EnvironmentVariableNameWithValue<string>,
    CCS3_REDIS_HOST: EnvironmentVariableNameWithValue<string>;
    CCS3_REDIS_PORT: EnvironmentVariableNameWithValue<number>;
}
