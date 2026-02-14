import { ValueOf } from '@computerclubsystem/types/declarations.mjs';
import { SelectQueryBuilder, WhereClauseOperation } from './query-builder.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class TariffInDeviceGroupQueryHelper {
    getTariffDeviceGroupsQueryData(tariffId: number): IQueryTextWithParamsResult {
        const selectBuilder = new SelectQueryBuilder();
        selectBuilder.setTableName(TableName.tariff_in_device_group);
        selectBuilder.addSelectColumnName(ColumnName.device_group_id);
        selectBuilder.addWhereClause({ columnName: ColumnName.tariff_id, operation: WhereClauseOperation.equals, parameterName: '$1' });
        const params = [
            tariffId,
        ];
        return {
            text: selectBuilder.getQueryString(),
            params: params,
        };
    }

    getAllTariffsInDeviceGroupsQueryData(): IQueryTextWithParamsResult {
        const selectBuilder = new SelectQueryBuilder();
        selectBuilder.setTableName(TableName.tariff_in_device_group);
        selectBuilder.addSelectColumnNames(this.getAllColumns());
        return {
            text: selectBuilder.getQueryString(),
            params: undefined,
        };
    }

    replaceTariffDeviceGroupIdsQueryData(tariffId: number, deviceGroupIds: number[]): IQueryTextWithParamsResult {
        // TODO: Find better way like returning multiple lines with their parameters so the caller can execute them one by one
        tariffId = +tariffId;
        const parts: string[] = [this.removeTariffDeviceGroupsQueryText.replace('$1', `${tariffId}`)];
        for (const deviceGroupId of deviceGroupIds) {
            const addTariffText = this.addDeviceGroupToTariffQueryText.replace('$1', `${+tariffId}`).replace('$2', `${+deviceGroupId}`);
            parts.push(addTariffText);
        }
        const fullQueryText = parts.join('\r\n');
        return {
            text: fullQueryText,
            // TODO: Params are not needed because we replaced $1, $2 parameters with their values - instead return multiple lines with their parameters
            params: undefined,
        };
    }

    private readonly addDeviceGroupToTariffQueryText = `
        INSERT INTO tariff_in_device_group
        (
            tariff_id,
            device_group_id
        )
        VALUES
        (
            $1,
            $2
        );
    `;

    private readonly removeTariffDeviceGroupsQueryText = `
        DELETE FROM tariff_in_device_group
        WHERE tariff_id = $1;
    `;

    replaceDeviceGroupTariffIdsQueryData(deviceGroupId: number, tariffIds: number[]): IQueryTextWithParamsResult {
        // TODO: Find better way like returning multiple lines with their parameters so the caller can execute them one by one
        deviceGroupId = +deviceGroupId;
        tariffIds ||= [];
        const parts: string[] = [this.removeDeviceGroupTariffsQueryText.replace('$1', `${deviceGroupId}`)];
        for (const tariffId of tariffIds) {
            const addTariffText = this.addTariffToDeviceGroupQueryText.replace('$1', `${+tariffId}`).replace('$2', `${+deviceGroupId}`);
            parts.push(addTariffText);
        }
        const fullQueryText = parts.join('\r\n');
        return {
            text: fullQueryText,
            // TODO: Params are not needed because we replaced $1, $2 parameters with their values - instead return multiple lines with their parameters
            params: undefined,
        };
    }

    private readonly addTariffToDeviceGroupQueryText = `
        INSERT INTO tariff_in_device_group
        (
            tariff_id,
            device_group_id
        )
        VALUES
        (
            $1,
            $2
        );
    `;

    private readonly removeDeviceGroupTariffsQueryText = `
        DELETE FROM tariff_in_device_group
        WHERE device_group_id = $1;
    `;

    getAllTariffIdsInDeviceGroupQueryData(deviceGroupId: number): IQueryTextWithParamsResult {
        const selectBuilder = new SelectQueryBuilder();
        selectBuilder.setTableName(TableName.tariff_in_device_group);
        selectBuilder.addSelectColumnName(ColumnName.tariff_id);
        selectBuilder.addWhereClause({
            columnName: ColumnName.device_group_id,
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

    private getAllColumns(): ColumnName[] {
        const result = [
            ColumnName.id,
            ColumnName.tariff_id,
            ColumnName.device_group_id,
        ];
        return result;
    }
}

const TableName = {
    tariff_in_device_group: 'tariff_in_device_group',
} as const;
export type TableName = ValueOf<typeof TableName>;

const ColumnName = {
    id: 'id',
    tariff_id: 'tariff_id',
    device_group_id: 'device_group_id',
} as const;
export type ColumnName = ValueOf<typeof ColumnName>;