import { SelectQueryBuilder, WhereClauseOperation } from './query-builder.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class TariffInDeviceGroupQueryHelper {
    getAllTariffsInDeviceGroupsQueryData(): IQueryTextWithParamsResult {
        const selectBuilder = new SelectQueryBuilder();
        selectBuilder.setTableName(TableName.tariff_in_device_group);
        selectBuilder.addSelectColumnNames(this.getAllColumns());
        return {
            text: selectBuilder.getQueryString(),
            params: undefined,
        };
    }

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
        }
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

const enum TableName {
    tariff_in_device_group = 'tariff_in_device_group',
}

const enum ColumnName {
    id = 'id',
    tariff_id = 'tariff_id',
    device_group_id = 'device_group_id',
}