export class EnvironmentVariablesHelper {
    createEnvironmentVars(): EnvironmentVarsData {
        // The object keys must be the same as environment variable names
        const result: EnvironmentVarsData = {
            CCS3_CA_ISSUER_CERTIFICATE_SUBJECT: {},
            CCS3_REDIS_HOST: {},
            CCS3_REDIS_PORT: {},
            CCS3_PC_CONNECTOR_CERTIFICATE_CRT_FILE_PATH: {},
            CCS3_PC_CONNECTOR_CERTIFICATE_KEY_FILE_PATH: {},
            CCS3_PC_CONNECTOR_PORT: {},
        } as EnvironmentVarsData;
        Object.keys(result).forEach(key => this.setObjectValueByKey(result, key, { name: key } as EnvironmentVariableNameWithValue<any>));
        result.CCS3_CA_ISSUER_CERTIFICATE_SUBJECT.value = this.getEnvVarValue(result.CCS3_CA_ISSUER_CERTIFICATE_SUBJECT.name);
        result.CCS3_REDIS_HOST.value = this.getEnvVarValue(result.CCS3_REDIS_HOST.name, 'ccs3-valkey-service');
        result.CCS3_REDIS_PORT.value = this.getEnvironmentVarValueAsNumber(result.CCS3_REDIS_PORT.name, 6379);
        result.CCS3_PC_CONNECTOR_CERTIFICATE_CRT_FILE_PATH.value = this.getEnvVarValue(result.CCS3_PC_CONNECTOR_CERTIFICATE_CRT_FILE_PATH.name, './certificates/ccs3-pc-connector.crt');
        result.CCS3_PC_CONNECTOR_CERTIFICATE_KEY_FILE_PATH.value = this.getEnvVarValue(result.CCS3_PC_CONNECTOR_CERTIFICATE_KEY_FILE_PATH.name, './certificates/ccs3-pc-connector.key');
        result.CCS3_PC_CONNECTOR_PORT.value = this.getEnvironmentVarValueAsNumber(result.CCS3_PC_CONNECTOR_PORT.name, 65501);
        return result;
    }

    getEnvironmentVarValueAsNumber(envVar: string, defaultValue: number): number {
        const stringVal = this.getEnvVarValue(envVar);
        const numberVal = stringVal && parseInt(stringVal) || defaultValue;
        return numberVal;
    }

    getEnvVarValue(envVarName: string, defaultValue?: string): string | undefined {
        return process.env[envVarName] || defaultValue;
    }

    getObjectValueByKey(obj: any, key: string): any {
        return obj?.[key];
    }

    setObjectValueByKey(obj: any, key: string, value: any): void {
        (obj as any)[key] = value;
    }
}

export interface EnvironmentVariableNameWithValue<TValue> {
    name: string;
    value?: TValue;
}

export interface EnvironmentVarsData {
    CCS3_CA_ISSUER_CERTIFICATE_SUBJECT: EnvironmentVariableNameWithValue<string>;
    CCS3_REDIS_HOST: EnvironmentVariableNameWithValue<string>;
    CCS3_REDIS_PORT: EnvironmentVariableNameWithValue<number>;
    CCS3_PC_CONNECTOR_CERTIFICATE_CRT_FILE_PATH: EnvironmentVariableNameWithValue<string>;
    CCS3_PC_CONNECTOR_CERTIFICATE_KEY_FILE_PATH: EnvironmentVariableNameWithValue<string>;
    CCS3_PC_CONNECTOR_PORT: EnvironmentVariableNameWithValue<number>;
}
