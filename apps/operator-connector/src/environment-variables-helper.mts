export class EnvironmentVariablesHelper {
    getObjectValueByKey(obj: any, key: string): any {
        return obj?.[key];
    }

    setObjectValueByKey(obj: any, key: string, value: any): void {
        (obj as any)[key] = value;
    }

    createEnvironmentVars(): EnvironmentVarsData {
        // The object keys must be the same as environment variable names
        const result: EnvironmentVarsData = {
            CCS3_OPERATOR_CONNECTOR_NO_STATIC_FILES_SERVING: {} as EnvironmentVariableNameWithValue<boolean>,
            CCS3_OPERATOR_CONNECTOR_STATIC_FILES_PATH: {} as EnvironmentVariableNameWithValue<string | undefined>,
            CCS3_OPERATOR_CONNECTOR_CERTIFICATE_CRT_FILE_PATH: {} as EnvironmentVariableNameWithValue<string>,
            CCS3_OPERATOR_CONNECTOR_CERTIFICATE_KEY_FILE_PATH: {} as EnvironmentVariableNameWithValue<string>,
            CCS3_OPERATOR_CONNECTOR_ISSUER_CERTIFICATE_CRT_FILE_PATH: {} as EnvironmentVariableNameWithValue<string>,
            CCS3_OPERATOR_CONNECTOR_PORT: {} as EnvironmentVariableNameWithValue<number>,
            CCS3_REDIS_HOST: {} as EnvironmentVariableNameWithValue<string>,
            CCS3_REDIS_PORT: {} as EnvironmentVariableNameWithValue<number>,
        };
        Object.keys(result).forEach(key => this.setObjectValueByKey(result, key, { name: key } as EnvironmentVariableNameWithValue<any>));
        result.CCS3_OPERATOR_CONNECTOR_NO_STATIC_FILES_SERVING.value = this.getEnvironmentVarValueAsBoolean(result.CCS3_OPERATOR_CONNECTOR_NO_STATIC_FILES_SERVING.name, false);
        result.CCS3_OPERATOR_CONNECTOR_STATIC_FILES_PATH.value = this.getEnvVarValue(result.CCS3_OPERATOR_CONNECTOR_STATIC_FILES_PATH.name, './operator-web-app');
        result.CCS3_OPERATOR_CONNECTOR_CERTIFICATE_CRT_FILE_PATH.value = this.getEnvVarValue(result.CCS3_OPERATOR_CONNECTOR_CERTIFICATE_CRT_FILE_PATH.name, './certificates/ccs3-operator-connector.crt')!;
        result.CCS3_OPERATOR_CONNECTOR_CERTIFICATE_KEY_FILE_PATH.value = this.getEnvVarValue(result.CCS3_OPERATOR_CONNECTOR_CERTIFICATE_KEY_FILE_PATH.name, './certificates/ccs3-operator-connector.key')!;
        result.CCS3_OPERATOR_CONNECTOR_ISSUER_CERTIFICATE_CRT_FILE_PATH.value = this.getEnvVarValue(result.CCS3_OPERATOR_CONNECTOR_ISSUER_CERTIFICATE_CRT_FILE_PATH.name, './certificates/ccs3-ca.crt')!;
        result.CCS3_OPERATOR_CONNECTOR_PORT.value = this.getEnvironmentVarValueAsNumber(result.CCS3_OPERATOR_CONNECTOR_PORT.name, 65502);
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
    CCS3_REDIS_HOST: EnvironmentVariableNameWithValue<string>;
    CCS3_REDIS_PORT: EnvironmentVariableNameWithValue<number>;
    CCS3_OPERATOR_CONNECTOR_STATIC_FILES_PATH: EnvironmentVariableNameWithValue<string | undefined>;
    CCS3_OPERATOR_CONNECTOR_NO_STATIC_FILES_SERVING: EnvironmentVariableNameWithValue<boolean>;
    CCS3_OPERATOR_CONNECTOR_CERTIFICATE_CRT_FILE_PATH: EnvironmentVariableNameWithValue<string>;
    CCS3_OPERATOR_CONNECTOR_CERTIFICATE_KEY_FILE_PATH: EnvironmentVariableNameWithValue<string>;
    CCS3_OPERATOR_CONNECTOR_ISSUER_CERTIFICATE_CRT_FILE_PATH: EnvironmentVariableNameWithValue<string>;
    CCS3_OPERATOR_CONNECTOR_PORT: EnvironmentVariableNameWithValue<number>;
}
