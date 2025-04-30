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
import { IDeviceStatus, IDeviceStatusWithContinuationData } from 'src/storage/entities/device-status.mjs';
import { QueryUtils } from './queries/query-utils.mjs';
import { ISystemSetting } from 'src/storage/entities/system-setting.mjs';
import { IDeviceConnectionEvent } from 'src/storage/entities/device-connection-event.mjs';
import { IOperatorConnectionEvent } from 'src/storage/entities/operator-connection-event.mjs';
import { ITariff } from 'src/storage/entities/tariff.mjs';
import { IDeviceSession } from 'src/storage/entities/device-session.mjs';
import { IRole } from 'src/storage/entities/role.mjs';
import { IPermission } from 'src/storage/entities/permission.mjs';
import {
    CompleteDeviceStatusUpdateResult, ICompletedSessionsSummary, IncreaseTariffRemainingSecondsResult,
    TransferDeviceResult
} from 'src/storage/results.mjs';
import { IDeviceContinuation } from 'src/storage/entities/device-continuation.mjs';
import { ITariffRecharge } from 'src/storage/entities/tariff-recharge.mjs';
import { IShift } from 'src/storage/entities/shift.mjs';
import { IShiftsSummary } from 'src/storage/entities/shifts-summary.mjs';
import { ISystemSettingNameWithValue } from 'src/storage/entities/system-setting-name-with-value.mjs';
import { IUserProfileSetting } from 'src/storage/entities/user-profile-setting.mjs';
import { IUserProfileSettingWithValue } from 'src/storage/entities/user-profile-setting-with-value.mjs';
import { IDeviceGroup } from 'src/storage/entities/device-group.mjs';
import { ITariffInDeviceGroup } from 'src/storage/entities/tariff-in-device-group.mjs';
import { IDeviceTransfer } from 'src/storage/entities/device-transfer.mjs';
import { ILongLivedAccessToken } from 'src/storage/entities/long-lived-access-token.mjs';
import { ILongLivedAccessTokenUsage } from 'src/storage/entities/long-lived-access-token-usage.mjs';

export class PostgreStorageProvider implements StorageProvider {
    private state: PostgreStorageProviderState;
    private logger: Logger;
    private readonly className = (this as object).constructor.name;
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
            const temp = new Date(stringValue);
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

    async addLongLivedAccessTokenUsage(longLivedAccessTokenUsage: ILongLivedAccessTokenUsage): Promise<ILongLivedAccessTokenUsage | undefined> {
        const queryData = this.queryUtils.addLongLivedAccessTokenUsage(longLivedAccessTokenUsage);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as ILongLivedAccessTokenUsage | undefined;
    }


    async getLongLivedAccessToken(token: string): Promise<ILongLivedAccessToken | undefined> {
        const queryData = this.queryUtils.getLongLivedAccessToken(token);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as ILongLivedAccessToken | undefined;
    }

    async setLongLivedAccessToken(longLivedAccessToken: ILongLivedAccessToken): Promise<ILongLivedAccessToken | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');

            if (longLivedAccessToken.user_id) {
                const deleteTokensQueryData = this.queryUtils.deleteLongLivedAccessTokensByUserId(longLivedAccessToken.user_id);
                await transactionClient.query(deleteTokensQueryData.text, deleteTokensQueryData.params);
            }

            const setLongLivedAccessTokenQueryData = this.queryUtils.setLongLivedAccessToken(longLivedAccessToken);
            const setLongLivedAccessTokenRes = await transactionClient.query(setLongLivedAccessTokenQueryData.text, setLongLivedAccessTokenQueryData.params);
            const createdLongLivedAccessToken = setLongLivedAccessTokenRes.rows[0] as ILongLivedAccessToken;
            if (!createdLongLivedAccessToken) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            }

            await transactionClient.query('COMMIT');
            return createdLongLivedAccessToken;
        } catch (err) {
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
    }

    async getTariffDeviceGroups(tariffId: number): Promise<number[]> {
        const queryData = this.queryUtils.getTariffDeviceGroupsQueryData(tariffId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows.map((x: ITariffInDeviceGroup) => x.device_group_id);;
    }

    // async setTariffDeviceGroups(tariffId: number, deviceGroupIds: number[]): Promise<void> {

    // }

    async getDeviceSessions(
        fromDate: string,
        toDate: string,
        userId: number | null | undefined,
        deviceId: number | null | undefined,
        tariffId: number | null | undefined,
    ): Promise<IDeviceSession[]> {
        const queryData = this.queryUtils.getDeviceSessionsQueryData(fromDate, toDate, userId, deviceId, tariffId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows as IDeviceSession[];
    }

    async getAllTariffsInDeviceGroups(): Promise<ITariffInDeviceGroup[]> {
        const queryData = this.queryUtils.getAllTariffsInDeviceGroupsQueryData();
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows as ITariffInDeviceGroup[];
    }

    async updateDeviceGroup(deviceGroup: IDeviceGroup, assignedTariffIds: number[] | undefined | null): Promise<IDeviceGroup | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            const updateDeviceGroupQueryData = this.queryUtils.updateDeviceGroupQueryData(deviceGroup);
            const updatedDeviceGroupRes = await transactionClient.query(updateDeviceGroupQueryData.text, updateDeviceGroupQueryData.params);
            const updatedDeviceGroup = updatedDeviceGroupRes.rows[0] as IDeviceGroup | undefined;
            if (!updatedDeviceGroup) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            }
            if (assignedTariffIds) {
                const replaceTariffIdsQueryData = this.queryUtils.replaceDeviceGroupTariffIdsQueryData(updatedDeviceGroup.id, assignedTariffIds);
                await transactionClient.query(replaceTariffIdsQueryData.text, replaceTariffIdsQueryData.params);
            }
            await transactionClient.query('COMMIT');
            return updatedDeviceGroup;
        } catch (err) {
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
    }

    async createDeviceGroup(deviceGroup: IDeviceGroup, assignedTariffIds: number[] | undefined | null): Promise<IDeviceGroup | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            const createDeviceGroupQueryData = this.queryUtils.createDeviceGroupQueryData(deviceGroup);
            const createdDeviceGroupRes = await transactionClient.query(createDeviceGroupQueryData.text, createDeviceGroupQueryData.params);
            const createdDeviceGroup = createdDeviceGroupRes.rows[0] as IDeviceGroup | undefined;
            if (!createdDeviceGroup) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            }
            if (assignedTariffIds) {
                const replaceTariffIdsQueryData = this.queryUtils.replaceDeviceGroupTariffIdsQueryData(createdDeviceGroup.id, assignedTariffIds);
                await transactionClient.query(replaceTariffIdsQueryData.text, replaceTariffIdsQueryData.params);
            }
            await transactionClient.query('COMMIT');
            return createdDeviceGroup;
        } catch (err) {
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
    }


    async getAllDeviceIdsInDeviceGroup(deviceGroupId: number): Promise<number[]> {
        const queryData = this.queryUtils.getAllDeviceIdsInDeviceGroupQueryData(deviceGroupId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows.map((x: IDevice) => x.id) as number[];
    }

    async getAllTariffIdsInDeviceGroup(deviceGroupId: number): Promise<number[]> {
        const queryData = this.queryUtils.getAllTariffIdsInDeviceGroupQueryData(deviceGroupId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows.map((x: ITariffInDeviceGroup) => x.tariff_id) as number[];
    }

    async getDeviceGroup(deviceGroupId: number): Promise<IDeviceGroup | undefined> {
        const queryData = this.queryUtils.getDeviceGroupQueryData(deviceGroupId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IDeviceGroup | undefined;
    }

    async getAllDeviceGroups(): Promise<IDeviceGroup[]> {
        const queryData = this.queryUtils.getAllDeviceGroupsQueryData();
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows as IDeviceGroup[];
    }

    async updateUserProfileSettings(userId: number, profileSettings: IUserProfileSettingWithValue[]): Promise<void> {
        let transactionClient: pg.PoolClient | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            for (const profileSetting of profileSettings) {
                const queryData = this.queryUtils.updateUserProfileSettingQueryData(userId, profileSetting);
                await transactionClient.query(queryData.text, queryData.params);
            }
            await transactionClient?.query('COMMIT');
        } catch (err) {
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
    }


    async getUserProfileSettingWithValues(userId: number): Promise<IUserProfileSettingWithValue[]> {
        const queryData = this.queryUtils.getUserProfileSettingWithValuesQueryData(userId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows as IUserProfileSettingWithValue[];
    }

    async getAllUserProfileSettings(): Promise<IUserProfileSetting[]> {
        const queryData = this.queryUtils.getAllUserProfileSettingsQueryData();
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows as IUserProfileSetting[];
    }

    async changePassword(userId: number, currentPasswordHash: string, newPasswordHash: string): Promise<boolean> {
        const queryData = this.queryUtils.changePasswordQueryData(userId, currentPasswordHash, newPasswordHash);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rowCount === 1;
    }


    async getRechargedTariffsForDateTimeInterval(fromDate: string, toDate: string): Promise<ITariffRecharge[]> {
        const queryData = this.queryUtils.getRechargedTariffsForDateTimeIntervalQueryData(fromDate, toDate);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows as ITariffRecharge[];
    }

    async getCreatedTariffsForDateTimeInterval(fromDate: string | undefined | null, toDate: string): Promise<ITariff[]> {
        const queryData = this.queryUtils.getCreatedTariffsForDateTimeIntervalQueryData(fromDate, toDate);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows as ITariff[];
    }

    async getShifts(fromDate: string, toDate: string, userId: number | null | undefined): Promise<IShift[]> {
        const queryData = this.queryUtils.getShiftsQueryData(fromDate, toDate, userId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows as IShift[];
    }

    async getShiftsSummary(fromDate: string, toDate: string, userId: number | null | undefined): Promise<IShiftsSummary> {
        const queryData = this.queryUtils.getShiftsSummaryQueryData(fromDate, toDate, userId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IShiftsSummary;
    }

    async addShift(shift: IShift): Promise<IShift | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        let result: IShift | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');

            // First create the shift
            const addShiftQueryData = this.queryUtils.addShiftQueryData(shift);
            const addShiftQueryRes = await transactionClient.query(addShiftQueryData.text, addShiftQueryData.params);
            const createdShift = addShiftQueryRes.rows[0] as IShift | undefined;
            if (!createdShift) {
                await transactionClient.query('ROLLBACK');
                return undefined;
            }

            // Then get all records from device_status and create them in shift_device_status for the created shift
            const insertIntoShiftDeviceStatusTableQueryData = this.queryUtils.insertAllDeviceStatusesQueryData(createdShift.id);
            await transactionClient.query(insertIntoShiftDeviceStatusTableQueryData.text, insertIntoShiftDeviceStatusTableQueryData.params);

            // Now get all records from device_continuation and create them in shift_device_continuation for the created shift
            const insertAllDeviceContinuationsQueryData = this.queryUtils.insertAllDeviceContinuationsQueryData(createdShift.id);
            await transactionClient.query(insertAllDeviceContinuationsQueryData.text, insertAllDeviceContinuationsQueryData.params);

            await transactionClient?.query('COMMIT');
            result = createdShift;
            return result;
        } catch (err) {
            result = undefined;
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
    }

    async getCompletedSessionsSummary(fromDate: string | null | undefined, toDate: string): Promise<ICompletedSessionsSummary> {
        // This will get only total and count
        const queryData = this.queryUtils.getCompletedSessionsSummaryQueryData(fromDate, toDate);
        const res = await this.execQuery(queryData.text, queryData.params);
        const result = res.rows[0] as ICompletedSessionsSummary;
        // This will get the sessions too
        const completedSessionsQueryData = this.queryUtils.getCompletedSessionsQueryData(fromDate, toDate);
        const sessionsRes = await this.execQuery(completedSessionsQueryData.text, completedSessionsQueryData.params);
        result.completedSessions = sessionsRes.rows as IDeviceSession[];
        return result;
    }

    async getLastShift(): Promise<IShift | undefined> {
        const queryData = this.queryUtils.getLastShiftQueryData();
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IShift | undefined;
    }

    async transferDevice(sourceDeviceId: number, targetDeviceId: number, userId: number, transferNote: boolean | undefined | null, transferredAt: string): Promise<TransferDeviceResult | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        let result: TransferDeviceResult | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            const sourceDeviceStatusQueryData = this.queryUtils.getDeviceStatusQuery(sourceDeviceId);
            const sourceDeviceStatusResult = await transactionClient.query(sourceDeviceStatusQueryData.text, sourceDeviceStatusQueryData.params);
            const sourceDeviceStatus = sourceDeviceStatusResult.rows[0] as IDeviceStatus;
            if (!sourceDeviceStatus) {
                await transactionClient.query('ROLLBACK');
                return undefined;
            }
            const targetDeviceStatusQueryData = this.queryUtils.getDeviceStatusQuery(targetDeviceId);
            const targetDeviceStatusResult = await transactionClient.query(targetDeviceStatusQueryData.text, targetDeviceStatusQueryData.params);
            const targetDeviceStatus = targetDeviceStatusResult.rows[0] as IDeviceStatus;
            if (!targetDeviceStatus) {
                await transactionClient.query('ROLLBACK');
                return undefined;
            }

            const addDeviceTransferQueryData = this.queryUtils.addDeviceTransfer(sourceDeviceStatus, targetDeviceStatus, userId, transferredAt);
            const addDeviceTransferResult = await transactionClient.query(addDeviceTransferQueryData.text, addDeviceTransferQueryData.params);
            const addedDeviceTransfer = addDeviceTransferResult.rows[0] as IDeviceTransfer;
            if (!addedDeviceTransfer) {
                await transactionClient.query('ROLLBACK');
                return undefined;
            }

            // Just switch device ids
            const tempSourceDeviceId = sourceDeviceStatus.device_id;
            sourceDeviceStatus.device_id = targetDeviceStatus.device_id;
            targetDeviceStatus.device_id = tempSourceDeviceId;
            if (transferNote) {
                // Transfer note is requested
                // Target device note must become source device note but if target device already has note,
                // the source device note must be added to the existing note
                // The source device becomes target because we switched their device_id values only
                const noteAddition = targetDeviceStatus.note ? ` / ${targetDeviceStatus.note}` : '';
                sourceDeviceStatus.note = sourceDeviceStatus.note ? `${sourceDeviceStatus.note}${noteAddition}` : targetDeviceStatus.note;
                // Target device note must be cleared
                targetDeviceStatus.note = null;
            } else {
                // Note should not be transferred
                // Because we exchange device_id of the records, we must exchange their notes in order to keep the note
                // at their original device_ids
                const targetNote = targetDeviceStatus.note;
                targetDeviceStatus.note = sourceDeviceStatus.note;
                sourceDeviceStatus.note = targetNote;
            }
            const updateSourceDeviceStatusQueryData = this.queryUtils.updateDeviceStatusQuery(sourceDeviceStatus);
            const updatedSourceDeviceStatusResult = await transactionClient.query(updateSourceDeviceStatusQueryData.text, updateSourceDeviceStatusQueryData.params);
            const updatedSourceDeviceStatus = updatedSourceDeviceStatusResult.rows[0] as IDeviceStatus;
            if (!updatedSourceDeviceStatus) {
                await transactionClient.query('ROLLBACK');
                return undefined;
            }
            const updateTargetDeviceStatusQueryData = this.queryUtils.updateDeviceStatusQuery(targetDeviceStatus);
            const updatedTargetDeviceStatusResult = await transactionClient.query(updateTargetDeviceStatusQueryData.text, updateTargetDeviceStatusQueryData.params);
            const updatedTargetDeviceStatus = updatedTargetDeviceStatusResult.rows[0] as IDeviceStatus;
            if (!updatedTargetDeviceStatus) {
                await transactionClient.query('ROLLBACK');
                return undefined;
            }

            // Also change device continuation if any
            const updateDeviceContinuationDeviceIdQueryData = this.queryUtils.updateDeviceContinuationDeviceIdQuery(sourceDeviceId, targetDeviceId);
            await transactionClient.query(updateDeviceContinuationDeviceIdQueryData.text, updateDeviceContinuationDeviceIdQueryData.params);

            // TODO: Save record in new table with source and target device status properties, the user id that made the transfer and current date-time
            await transactionClient.query('COMMIT');
            result = {
                sourceDeviceStatus: sourceDeviceStatus,
                targetDeviceStatus: targetDeviceStatus,
            };
            return result;
        } catch (err) {
            result = undefined;
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
    }


    async updateUserWithRoles(user: IUser, roleIds: number[], passwordHash?: string): Promise<IUser | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        let updatedUser: IUser | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            const updateUserQueryData = this.queryUtils.updateUserQueryData(user, passwordHash);
            const updateUserResult = await transactionClient.query(updateUserQueryData.text, updateUserQueryData.params);
            updatedUser = updateUserResult.rows[0] as IUser | undefined;
            if (!updatedUser) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            } else {
                const replaceUserRolesQueryData = this.queryUtils.replaceUserRolesQueryData(updatedUser.id, roleIds);
                await transactionClient.query(replaceUserRolesQueryData.text);
            }
            await transactionClient?.query('COMMIT');
        } catch (err) {
            updatedUser = undefined;
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
        return updatedUser;
    }

    async createUserWithRoles(user: IUser, passwordHash: string, roleIds: number[]): Promise<IUser | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        let createdUser: IUser | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            const createUserQueryData = this.queryUtils.createUserQueryData(user, passwordHash);
            const createUserResult = await transactionClient.query(createUserQueryData.text, createUserQueryData.params);
            createdUser = createUserResult.rows[0] as IUser | undefined;
            if (!createdUser) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            } else {
                const replaceUserRolesQueryData = this.queryUtils.replaceUserRolesQueryData(createdUser.id, roleIds);
                await transactionClient.query(replaceUserRolesQueryData.text);
            }
            await transactionClient?.query('COMMIT');
        } catch (err) {
            createdUser = undefined;
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
        return createdUser;
    }

    async createRoleWithPermissions(role: IRole, permissionIds: number[]): Promise<IRole | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        let createdRole: IRole | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            const createRoleQueryData = this.queryUtils.createRoleQueryData(role);
            const createRoleResult = await transactionClient.query(createRoleQueryData.text, createRoleQueryData.params);
            createdRole = createRoleResult.rows[0] as IRole | undefined;
            if (!createdRole) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            } else {
                const replaceRolePermissionsQueryData = this.queryUtils.replaceRolePermissionsQueryData(createdRole.id, permissionIds);
                await transactionClient.query(replaceRolePermissionsQueryData.text);
            }
            await transactionClient?.query('COMMIT');
        } catch (err) {
            createdRole = undefined;
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
        return createdRole;
    }

    async updateRoleWithPermissions(role: IRole, permissionIds: number[]): Promise<IRole | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        let updatedRole: IRole | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            const updatedRoleQueryData = this.queryUtils.updateRoleQueryData(role);
            const updateRoleResult = await transactionClient.query(updatedRoleQueryData.text, updatedRoleQueryData.params);
            updatedRole = updateRoleResult.rows[0] as IRole | undefined;
            if (!updatedRole) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            } else {
                const replaceRolePermissionsQueryData = this.queryUtils.replaceRolePermissionsQueryData(updatedRole.id, permissionIds);
                await transactionClient.query(replaceRolePermissionsQueryData.text);
            }
            await transactionClient?.query('COMMIT');
        } catch (err) {
            updatedRole = undefined;
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
        return updatedRole;
    }

    async getAllPermissions(): Promise<IPermission[]> {
        const queryText = this.queryUtils.getAllPermissionsQueryText();
        const res = await this.execQuery(queryText);
        return res.rows as IPermission[];
    }

    async getRolePermissionIds(roleId: number): Promise<number[]> {
        const queryData = this.queryUtils.getRolePermissionIdsQueryData(roleId);
        const res = await this.execQuery(queryData.text, queryData.params);
        const typedRows = res.rows as { permission_id: number }[];
        return typedRows.map(x => x.permission_id) as number[];
    }

    async getAllRoles(): Promise<IRole[]> {
        const queryText = this.queryUtils.getAllRolesQueryText();
        const res = await this.execQuery(queryText);
        return res.rows as IRole[];
    }

    async getRoleById(roleId: number): Promise<IRole | undefined> {
        const queryData = this.queryUtils.getRoleByIdQueryData(roleId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IRole | undefined;
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

    async updateSystemSettingsValues(systemSettingsNamesWithValues: ISystemSettingNameWithValue[]): Promise<void> {
        let transactionClient: pg.PoolClient | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            for (const item of systemSettingsNamesWithValues) {
                const updateQuery = this.queryUtils.updateSystemSettingValueQueryData(item);
                await transactionClient.query(updateQuery.text, updateQuery.params);
            }
            await transactionClient?.query('COMMIT');
        } catch (err) {
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
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

    async getDeviceStatusesByTariffId(tariffId: number): Promise<IDeviceStatus[]> {
        const query = this.queryUtils.getDeviceStatusesByTariffIdQuery(tariffId);
        const res = await this.execQuery(query.text, query.params);
        return res.rows as IDeviceStatus[];
    }

    async getAllDeviceStatusesWithContinuationData(): Promise<IDeviceStatusWithContinuationData[]> {
        const query = this.queryUtils.getAllDeviceStatusesWithContinuationDataQueryText();
        const res = await this.execQuery(query);
        return res.rows as IDeviceStatusWithContinuationData[];
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

    async createDeviceContinuation(deviceContinuation: IDeviceContinuation): Promise<IDeviceContinuation> {
        const queryData = this.queryUtils.upsertDeviceContinuationQueryData(deviceContinuation);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as IDeviceContinuation;
    }

    async completeDeviceStatusUpdate(deviceStatus: IDeviceStatusWithContinuationData, deviceSession: IDeviceSession): Promise<CompleteDeviceStatusUpdateResult | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        let result: CompleteDeviceStatusUpdateResult | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            const updateDeviceStatusQuery = this.queryUtils.updateDeviceStatusQuery(deviceStatus);
            const updateDeviceStatusResult = await transactionClient.query(updateDeviceStatusQuery.text, updateDeviceStatusQuery.params);
            const updatedDeviceStatus = updateDeviceStatusResult.rows[0] as IDeviceStatus | undefined;
            if (!updatedDeviceStatus) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            }
            const addDeviceSessionQuery = this.queryUtils.addDeviceSessionQueryData(deviceSession);
            const addDeviceSessionResult = await transactionClient.query(addDeviceSessionQuery.text, addDeviceSessionQuery.params);
            const addedDeviceSession = addDeviceSessionResult.rows[0] as IDeviceSession | undefined;
            if (!addedDeviceSession) {
                await transactionClient?.query('ROOLBACK');
                return undefined;
            }
            const deleteDeviceContinuationQuery = this.queryUtils.deleteDeviceContinuationQueryData(deviceStatus.device_id);
            await transactionClient.query(deleteDeviceContinuationQuery.text, deleteDeviceContinuationQuery.params);

            await transactionClient?.query('COMMIT');
            result = {
                deviceSession: addedDeviceSession,
                deviceStatus: updatedDeviceStatus,
            };
            return result;
        } catch (err) {
            result = undefined;
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
    }

    async setDeviceStatusNote(deviceIds: number[], note: string | null): Promise<void> {
        const queryData = this.queryUtils.setDeviceStatusNoteQueryData(deviceIds, note);
        await this.execQuery(queryData.text, queryData.params);
    }

    async deleteDeviceContinuation(deviceId: number): Promise<void> {
        const queryData = this.queryUtils.deleteDeviceContinuationQueryData(deviceId);
        await this.execQuery(queryData.text, queryData.params);
    }

    // async setDeviceStatusEnabledFlag(deviceId: number, enabled: boolean): Promise<void> {
    //     const query = this.queryHelper.setDeviceStatusEnabledFlag(deviceId, enabled);
    //     await this.execQuery(query.text, query.params);
    // }

    async getAllTariffs(types?: number[]): Promise<ITariff[]> {
        const queryData = this.queryUtils.getAllTariffsQueryData(types);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows as ITariff[];
    }

    async getTariffById(tariffId: number): Promise<ITariff | undefined> {
        const queryData = this.queryUtils.getTariffByIdQueryData(tariffId);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as ITariff | undefined;
    }

    async checkTariffPasswordHash(tariffId: number, passwordHash: string): Promise<boolean> {
        const queryData = this.queryUtils.checkTariffPasswordHashQueryData(tariffId, passwordHash);
        const res = await this.execQuery(queryData.text, queryData.params);
        return !!(res.rowCount && res.rowCount > 0);
    }


    async createTariff(tariff: ITariff, passwordHash: string | undefined | null, deviceGroupIds: number[] | undefined | null): Promise<ITariff | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            const queryData = this.queryUtils.createTariffQueryData(tariff, passwordHash);
            const res = await transactionClient.query(queryData.text, queryData.params);
            const createdTariff = res.rows[0] as ITariff;
            if (!createdTariff) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            }
            if (deviceGroupIds) {
                const replaceTariffDeviceGroupIdsQueryData = this.queryUtils.replaceTariffDeviceGroupsQueryData(createdTariff.id, deviceGroupIds);
                await transactionClient.query(replaceTariffDeviceGroupIdsQueryData.text, replaceTariffDeviceGroupIdsQueryData.params);
            }
            await transactionClient.query('COMMIT');
            return createdTariff;
        } catch (err) {
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
        // const queryData = this.queryUtils.createTariffQueryData(tariff, passwordHash);
        // const res = await this.execQuery(queryData.text, queryData.params);
        // return res.rows[0] as ITariff;
    }

    async updateTariff(tariff: ITariff, passwordHash: string | undefined | null, deviceGroupIds: number[] | undefined | null): Promise<ITariff | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');
            const queryData = this.queryUtils.updateTariffQueryData(tariff, passwordHash);
            const res = await transactionClient.query(queryData.text, queryData.params);
            const updatedTariff = res.rows[0] as ITariff;
            if (!updatedTariff) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            }
            if (deviceGroupIds) {
                const replaceTariffDeviceGroupIdsQueryData = this.queryUtils.replaceTariffDeviceGroupsQueryData(updatedTariff.id, deviceGroupIds);
                await transactionClient.query(replaceTariffDeviceGroupIdsQueryData.text, replaceTariffDeviceGroupIdsQueryData.params);
            }
            await transactionClient.query('COMMIT');
            return updatedTariff;
        } catch (err) {
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
    }

    async updateTariffRemainingSeconds(tariffId: number, remainingSeconds: number): Promise<ITariff | undefined> {
        const queryData = this.queryUtils.updateTariffRemainingSeconds(tariffId, remainingSeconds);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as ITariff;
    }

    async updateTariffPasswordHash(tariffId: number, passwordHash: string): Promise<ITariff | undefined> {
        const queryData = this.queryUtils.updateTariffPasswordHash(tariffId, passwordHash);
        const res = await this.execQuery(queryData.text, queryData.params);
        return res.rows[0] as ITariff;
    }

    async increaseTariffRemainingSeconds(tariffId: number, secondsToAdd: number, userId: number, increasedAt: string): Promise<IncreaseTariffRemainingSecondsResult | undefined> {
        let transactionClient: pg.PoolClient | undefined;
        let result: IncreaseTariffRemainingSecondsResult | undefined;
        try {
            transactionClient = await this.getPoolClient();
            await transactionClient.query('BEGIN');

            // Get the tariff first to check if it exists
            const getTariffByIdQueryData = this.queryUtils.getTariffByIdQueryData(tariffId);
            const tariffResult = await transactionClient.query(getTariffByIdQueryData.text, getTariffByIdQueryData.params);
            const tariff = tariffResult.rows[0] as ITariff | undefined;
            if (!tariff) {
                await transactionClient?.query('ROOLBACK');
                return undefined;
            }

            // Increase the remaining seconds
            const increaseTariffRemainingSecondsQuery = this.queryUtils.increaseTariffRemainingSeconds(tariffId, secondsToAdd, increasedAt, userId);
            const increaseTariffRemainingSecondsResult = await transactionClient.query(increaseTariffRemainingSecondsQuery.text, increaseTariffRemainingSecondsQuery.params);
            const updatedTariff = increaseTariffRemainingSecondsResult.rows[0] as ITariff | undefined;
            if (!updatedTariff) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            }

            // Create record about the increase
            const tariffRecharge: ITariffRecharge = {
                recharge_price: tariff.price,
                recharge_seconds: secondsToAdd,
                recharged_at: increasedAt,
                remaining_seconds_before_recharge: tariff.remaining_seconds!,
                tariff_id: tariff.id,
                user_id: userId,
            } as ITariffRecharge;
            const addTariffRechargeQueryData = this.queryUtils.addTariffRechargeQueryData(tariffRecharge);
            const addTariffRechargeResult = await transactionClient.query(addTariffRechargeQueryData.text, addTariffRechargeQueryData.params);
            const addedTariffRecharge = addTariffRechargeResult.rows[0] as ITariffRecharge | undefined;
            if (!addedTariffRecharge) {
                await transactionClient?.query('ROLLBACK');
                return undefined;
            }

            await transactionClient?.query('COMMIT');
            result = {
                tariff: updatedTariff,
                tariffRecharge: addedTariffRecharge,
            };
            return result;
        } catch (err) {
            result = undefined;
            await transactionClient?.query('ROLLBACK');
            throw err;
        } finally {
            transactionClient?.release();
        }
    }

    async getUserRoleIds(userId: number): Promise<number[]> {
        const queryData = this.queryUtils.getUserRoleIdsQueryData(userId);
        const res = await this.execQuery(queryData.text, queryData.params);
        const typedRows = res.rows as { role_id: number }[];
        return typedRows.map(x => x.role_id) as number[];
    }


    async getAllUsers(): Promise<IUser[]> {
        const queryText = this.queryUtils.getAllUsersQueryText();
        const res = await this.execQuery(queryText);
        return res.rows as IUser[];
    }

    async getUserByUsernameAndPasswordHash(username: string, passwordHash: string): Promise<IUser | undefined> {
        const queryData = this.queryUtils.getUserByUsernameAndPasswordHashQueryData(username, passwordHash);
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

    private async execQuery(query: string, params?: unknown[]): Promise<QueryResult<never>> {
        return await this.state.pool.query(query, params);
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
                    const scriptFilePath = path.join(dirEntry.parentPath, dirEntry.name);
                    const scriptContent = (await fs.readFile(scriptFilePath)).toString();
                    this.logger.log('Executing database migration script', scriptFilePath, scriptContent);
                    await migrateClient.query(scriptContent);
                    this.logger.log('Script execution completed');
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
