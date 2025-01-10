import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import pg, { QueryResult } from 'pg';

import { StorageProviderConfig } from 'src/storage/storage-provider-config.mjs';
import { StorageProvider } from 'src/storage/storage-provider.mjs';
import { StorageProviderInitResult } from 'src/storage/storage-provider-init-result.mjs';
import { Logger } from '../logger.mjs';
import { IMetadata } from 'src/storage/entities/metadata.mjs';
import { IDevice } from 'src/storage/entities/device.mjs';
import { IUser } from 'src/storage/entities/user.mjs';
import { IDeviceStatus } from 'src/storage/entities/device-status.mjs';
import { QueryUtils } from './queries/query-utils.mjs';
import { ISystemSetting } from 'src/storage/entities/system-setting.mjs';
import { IDeviceConnectionEvent } from 'src/storage/entities/device-connection-event.mjs';
import { IOperatorConnectionEvent } from 'src/storage/entities/operator-connection-event.mjs';
import { ITariff } from 'src/storage/entities/tariff.mjs';
import { IDeviceSession } from 'src/storage/entities/device-session.mjs';

export class PostgreStorageProvider implements StorageProvider {
    private state: PostgreStorageProviderState;
    private logger: Logger;
    private readonly className = (this as any).constructor.name;
    private readonly queryUtils = new QueryUtils();

    constructor() {
        this.logger = new Logger();
        this.logger.setPrefix(this.className);
        this.state = {} as PostgreStorageProviderState;
    }

    async init(config: StorageProviderConfig): Promise<StorageProviderInitResult> {
        const result: StorageProviderInitResult = { success: false };
        const connectionStringLength = config.connectionString?.length || 0;
        if (connectionStringLength === 0) {
            this.logger.error(`The connection string is empty. It must be in format postgresql://<host>:<port>/<database-name>?user=<username>&password=<password>`);
            result.success = false;
            return result;
        }
        this.state.config = config;
        this.state.pool = this.createConnectionPool();
        this.state.pool.on('error', (err: Error, client: pg.PoolClient) => this.handlePoolError(err, client));
        const migrateResult = await this.migrateDatabase();
        result.success = migrateResult.success;
        pg.types.setTypeParser(1114, stringValue => {
            // TODO: Revisit this - make it more effective if possible
            var temp = new Date(stringValue);
            const newDate = new Date(Date.UTC(
                temp.getFullYear(), temp.getMonth(), temp.getDate(), temp.getHours(), temp.getMinutes(), temp.getSeconds(), temp.getMilliseconds())
            );
            return newDate.toISOString();
        });
        pg.types.setTypeParser(1700, numericString => {
            // Numeric type is returned as string. We have to convert it to float
            return parseFloat(numericString);
        });
        return result;
    }


    async addDeviceSession(deviceSession: IDeviceSession): Promise<IDeviceSession> {
        const queryData = this.queryUtils.addDeviceSessionQueryData(deviceSession);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IDeviceSession;
    }

    async addOperatorConnectionEvent(operatorConnectionEvent: IOperatorConnectionEvent): Promise<IOperatorConnectionEvent | undefined> {
        const queryData = this.queryUtils.addOperatorConnectionEventQueryData(operatorConnectionEvent);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IOperatorConnectionEvent | undefined;
    }

    async addDeviceConnectionEvent(deviceConnectionEvent: IDeviceConnectionEvent): Promise<IDeviceConnectionEvent | undefined> {
        const queryData = this.queryUtils.addDeviceConnectionEventQueryData(deviceConnectionEvent);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IDeviceConnectionEvent | undefined;
    }

    async getSystemSettingByName(name: string): Promise<ISystemSetting | undefined> {
        const queryData = this.queryUtils.getSystemSettingByNameQueryData(name);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as ISystemSetting | undefined;
    }

    async getAllSystemSettings(): Promise<ISystemSetting[]> {
        const query = this.queryUtils.getAllSystemSettingsQuery();
        const res = await this.execQuery(query);
        return res.rows as ISystemSetting[];
    }

    async getAllDeviceStatuses(): Promise<IDeviceStatus[]> {
        const query = this.queryUtils.getAllDeviceStatusesQueryText();
        const res = await this.execQuery(query);
        return res.rows as IDeviceStatus[];
    }

    async getDeviceStatus(deviceId: number): Promise<IDeviceStatus | undefined> {
        const query = this.queryUtils.getDeviceStatusQuery(deviceId);
        const res = await this.execQuery(query.text, query.params);
        return res.rows[0] as IDeviceStatus | undefined;
    }

    async addOrUpdateDeviceStatusEnabled(deviceStatus: IDeviceStatus): Promise<IDeviceStatus | undefined> {
        const query = this.queryUtils.addOrUpdateDeviceStatusEnabledQuery(deviceStatus);
        const res = await this.execQuery(query.text, query.params);
        return res.rows[0] as IDeviceStatus | undefined;
    }

    async updateDeviceStatus(deviceStatus: IDeviceStatus): Promise<void> {
        const query = this.queryUtils.updateDeviceStatusQuery(deviceStatus);
        await this.execQuery(query.text, query.params);
    }

    // async setDeviceStatusEnabledFlag(deviceId: number, enabled: boolean): Promise<void> {
    //     const query = this.queryHelper.setDeviceStatusEnabledFlag(deviceId, enabled);
    //     await this.execQuery(query.text, query.params);
    // }

    async getAllTariffs(): Promise<ITariff[]> {
        const queryText = this.queryUtils.getAllTariffsQueryText();
        const res = await this.execQuery(queryText);
        return res.rows as ITariff[];
    }

    async getTariffById(tariffId: number): Promise<ITariff | undefined> {
        const queryData = this.queryUtils.getTariffByIdQueryData(tariffId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as ITariff | undefined;
    }


    async createTariff(tariff: ITariff): Promise<ITariff> {
        const queryData = this.queryUtils.createTariffQueryData(tariff);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as ITariff;
    }

    async updateTariff(tariff: ITariff): Promise<ITariff> {
        const queryData = this.queryUtils.updateTariffQueryData(tariff);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as ITariff;
    }

    async getUser(username: string, passwordHash: string): Promise<IUser | undefined> {
        const queryData = this.queryUtils.getUserQueryData(username, passwordHash);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IUser | undefined;
    }

    async getUserById(userId: number): Promise<IUser | undefined> {
        const queryData = this.queryUtils.getUserByIdQueryData(userId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IUser | undefined;
    }

    async getUserPermissions(userId: number): Promise<string[] | undefined> {
        const queryData = this.queryUtils.getUserPermissionsQueryData(userId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return (res.rows as { name: string }[]).map(x => x.name);
    }

    async createDevice(device: IDevice): Promise<IDevice> {
        const queryData = this.queryUtils.createDeviceQueryData(device);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IDevice;
    }

    async updateDevice(device: IDevice): Promise<IDevice> {
        const queryData = this.queryUtils.updateDeviceQueryData(device);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IDevice;
    }


    async getDeviceByCertificateThumbprint(certificateThumbprint: string): Promise<IDevice | undefined> {
        const queryData = this.queryUtils.getDeviceByCertificateThumbprintQueryData(certificateThumbprint);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IDevice | undefined;
    }

    async getDeviceById(deviceId: number): Promise<IDevice | undefined> {
        const queryData = this.queryUtils.getDeviceQueryData(deviceId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IDevice | undefined;
    }

    async getAllDevices(): Promise<IDevice[]> {
        const queryText = this.queryUtils.getAllDevicesQueryText();
        const res = await this.execQuery(queryText);
        return res.rows as IDevice[];
    }

    async stop(): Promise<void> {
        return this.state.pool.end();
    }

    private async execTransaction(query: string, params?: any[]): Promise<QueryResult<any>> {
        let client: pg.PoolClient | null = null;
        let res: QueryResult<any>;
        try {

            client = await this.getPoolClient();
            res = await client.query(query, params);
        } finally {
            client?.release();
        }
        return res;
    }

    private async execQuery(query: string, params?: any[]): Promise<QueryResult<any>> {
        let client: pg.PoolClient | null = null;
        let res: QueryResult<any>;
        try {
            //     client = await this.getPoolClient();
            //     res = await client.query(query, params);
            res = await this.state.pool.query(query, params);
        } finally {
            // client?.release();
        }
        return res;
    }

    private async migrateDatabase(): Promise<MigrateDatabaseResult> {
        this.logger.log(`Using connection string with length ${this.state.config.connectionString.length}`);

        const result: MigrateDatabaseResult = { success: false };

        // TODO: Check if this.state.config.adminConnectionString
        //       If provided, try to use it to check for existence of database and credentials
        //       specified in this.state.config.connectionString
        //       If the database or credentials do not exist - create them and make the credentials owner to the databs
        if (this.state.config.adminConnectionString) {
            try {
                await this.createDatabaseAndCredentials();
            } catch (err) {
                this.logger.error(`Cannot create the database and credentials`, err);
                result.success = false;
                return result;
            }
        }

        let migrateClient: pg.PoolClient | undefined;
        try {
            migrateClient = await this.getPoolClient();
            await migrateClient.query('BEGIN');
            let databaseVersion = 0;
            try {
                const existenceResult = await migrateClient.query(`
                    SELECT EXISTS (
                        SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='db_metadata'
                    );`
                );
                if (existenceResult.rowCount === 1 && existenceResult.rows[0].exists) {
                    const versionResult = await migrateClient.query(`SELECT value FROM db_metadata WHERE name=$1::text`, ['database-version']);
                    if (versionResult.rowCount === 1) {
                        databaseVersion = parseInt((versionResult.rows[0] as IMetadata).value!);
                    }
                } else {
                    databaseVersion = 0;
                }
            } catch (err) {
                this.logger.log('Cannot get database version', err);
                result.success = false;
                return result;
            }

            this.logger.log('Database version', databaseVersion);
            const migrationsScriptsPath = path.resolve(this.state.config.databaseMigrationsPath);
            const dirEntries = await fs.readdir(migrationsScriptsPath, { withFileTypes: true });
            // Sort as file names are numbers
            const sortedDirEntries = [...dirEntries].sort((a, b) => parseInt(path.parse(a.name).name) - parseInt(path.parse(b.name).name));
            // TODO: Check if all the files are in sequence without gaps and that the database version is less that or equal to the last script
            if (databaseVersion !== sortedDirEntries.length) {
                this.logger.log('Will migrate the database version from', databaseVersion, 'to', sortedDirEntries.length);
                for (let i = databaseVersion + 1; i <= sortedDirEntries.length; i++) {
                    const dirEntry = sortedDirEntries[i - 1];
                    const scriptFilePath = path.join(dirEntry.path, dirEntry.name);
                    const scriptContent = (await fs.readFile(scriptFilePath)).toString();
                    this.logger.log('Executing database migration script', scriptFilePath, scriptContent);
                    const queryResult = await migrateClient.query(scriptContent);
                    this.logger.log('Script execution completed');
                    // TODO: Show the results of the query - it could be array or something ele
                    if (Array.isArray(queryResult)) {
                    }
                }
            } else {
                this.logger.log('Database version is up to date');
            }
            await migrateClient.query('COMMIT');
        } catch (err) {
            this.logger.error(`Cannot update the database`, err);
            await migrateClient?.query('ROLLBACK');
            result.success = false;
            return result;
        } finally {
            migrateClient?.release();
        }

        result.success = true;
        return result;
    }

    private async createDatabaseAndCredentials(): Promise<void> {
        // let createDatabaseClient: pg.Client | undefined;
        // let dbName: string | null = null;
        // try {
        //     const url = new URL(this.state.config.connectionString);
        //     dbName = url.pathname.replaceAll('/', '') || url.searchParams.get('dbname');
        //     this.logger.log(`Using database '${dbName}'`);
        //     if (!dbName) {
        //         // result.success = false;
        //         const errMessage = `The connection string dbname is missing or empty`;
        //         this.logger.error(errMessage);
        //         // return result;
        //         throw new Error(errMessage);
        //     }
        //     // TODO: Connection string that contains non-existent database
        //     //       cannot be used to create the database
        //     //       because it throws exception with code 3D000 "database ... does not exist" when connected.
        //     //       For now the database must be already created and the specified user must have access to it
        //     //       or we must use second connection string specifying no database and a user that can create databases
        //     //       and assign users to them. This second connection string will be used to create the database and the user
        //     //       and when ready, the application will switch to the first connection string. For security reasons,
        //     //       this would require removing the second (admin) connection string environment variable after the database is created
        //     createDatabaseClient = new pg.Client({ connectionString: this.state.config.adminConnectionString });
        //     const res = await createDatabaseClient.query(`SELECT FROM pg_database WHERE datname=$1::text`, [dbName]);
        //     if (res.rowCount === 0) {
        //         this.logger.log(`The database does not exist. Will create it`);
        //         const createDatabaseRes = await createDatabaseClient.query(`CREATE DATABASE "${dbName}"`);
        //         this.logger.log(`The database was created`);
        //     }
        // } catch (err) {
        //     this.logger.error(`Cannot create the database`, err);
        //     // result.success = false;
        //     // return result;
        //     throw err;
        // } finally {
        //     createDatabaseClient?.end();
        // }
    }

    private createConnectionPool(): pg.Pool {
        return new pg.Pool({ connectionString: this.state.config.connectionString } as pg.PoolConfig);
    }

    private async getPoolClient(): Promise<pg.PoolClient> {
        const client = await this.state.pool.connect();
        return client;
    }

    private handlePoolError(err: Error, client: pg.PoolClient): void {
        this.logger.error(`Pool error: ${err.message}`);
    }
}

interface PostgreStorageProviderState {
    config: StorageProviderConfig;
    pool: pg.Pool;
}

interface MigrateDatabaseResult {
    success: boolean;
}
