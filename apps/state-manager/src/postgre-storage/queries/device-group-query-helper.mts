import { IDeviceGroup } from 'src/storage/entities/device-group.mjs';
import { InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder, WhereClauseOperation } from './query-builder.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { ValueOf } from '@computerclubsystem/types/declarations.mjs';

export class DeviceGroupQueryHelper {
    updateDeviceGroupQueryData(deviceGroup: IDeviceGroup): IQueryTextWithParamsResult {
        const builder = new UpdateQueryBuilder();
        builder.setTableName(TableName.device_group);
        builder.addUpdateColumnNameWithValue(ColumnName.description, deviceGroup.description);
        builder.addUpdateColumnNameWithValue(ColumnName.enabled, deviceGroup.enabled);
        builder.addUpdateColumnNameWithValue(ColumnName.name, deviceGroup.name);
        builder.addUpdateColumnNameWithValue(ColumnName.restrict_device_transfers, deviceGroup.restrict_device_transfers);
        builder.addWhereParameterColumnNameWithValue(ColumnName.id, deviceGroup.id);
        builder.addReturningColumnNames(this.getAllColumnNames());
        const result: IQueryTextWithParamsResult = {
            text: builder.getQueryString(),
            params: builder.getParameterValues(),
        };
        return result;
    }

    createDeviceGroupQueryData(deviceGroup: IDeviceGroup): IQueryTextWithParamsResult {
        const insertBuilder = new InsertQueryBuilder();
        insertBuilder.setTableName(TableName.device_group);
        const insertColumnNames = [
            ColumnName.description,
            ColumnName.enabled,
            ColumnName.name,
            ColumnName.restrict_device_transfers,
        ];
        const params = [
            deviceGroup.description,
            deviceGroup.enabled,
            deviceGroup.name,
            deviceGroup.restrict_device_transfers,
        ];
        const returningColumnNames = [ColumnName.id, ...insertColumnNames];
        insertBuilder.addManyInsertColumnNames(insertColumnNames);
        insertBuilder.addReturningColumnNames(returningColumnNames);
        return {
            text: insertBuilder.getQueryString(),
            params: params,
        };
    }

    getDeviceGroupQueryData(deviceGroupId: number): IQueryTextWithParamsResult {
        const selectBuilder = new SelectQueryBuilder();
        selectBuilder.setTableName(TableName.device_group);
        selectBuilder.addSelectColumnNames(this.getAllColumnNames());
        selectBuilder.addWhereClause({
            columnName: ColumnName.id,
            operation: WhereClauseOperation.equals,
            parameterName: '$1'
        });
        const params = [
            deviceGroupId,
        ];
        return {
            text: selectBuilder.getQueryString(),
            params: params,
        };
    }

    getAllDeviceGroupsQueryData(): IQueryTextWithParamsResult {
        const selectBuilder = new SelectQueryBuilder();
        selectBuilder.setTableName(TableName.device_group);
        selectBuilder.addSelectColumnNames(this.getAllColumnNames());
        return {
            text: selectBuilder.getQueryString(),
            params: [],
        };
    }

    private getAllColumnNames(): ColumnName[] {
        return [
            ColumnName.id,
            ColumnName.name,
            ColumnName.description,
            ColumnName.enabled,
            ColumnName.restrict_device_transfers,
        ];
    }
}

const TableName = {
    device_group: 'device_group',
} as const;
export type TableName = ValueOf<typeof TableName>;

const ColumnName = {
    id: 'id',
    name: 'name',
    description: 'description',
    enabled: 'enabled',
    restrict_device_transfers: 'restrict_device_transfers',
} as const;
export type ColumnName = ValueOf<typeof ColumnName>;