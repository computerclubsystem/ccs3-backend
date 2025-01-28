import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { InsertQueryBuilder } from './query-builder.mjs';
import { ITariffRecharge } from 'src/storage/entities/tariff-recharge.mjs';

export class TariffRechargeQueryHelper {
    addTariffRechargeQueryData(tariffRecharge: ITariffRecharge): IQueryTextWithParamsResult {
        const builder = this.createInsertQueryBuilder();
        builder.setTableName(TableName.tariff_recharge);
        builder.addInsertColumnName(ColumnName.recharge_price);
        builder.addInsertColumnName(ColumnName.recharge_seconds);
        builder.addInsertColumnName(ColumnName.recharged_at);
        builder.addInsertColumnName(ColumnName.remaining_seconds_before_recharge);
        builder.addInsertColumnName(ColumnName.tariff_id);
        builder.addInsertColumnName(ColumnName.user_id);
        builder.addReturningColumnNames(this.getReturningColumnNames());

        const params = [
            tariffRecharge.recharge_price,
            tariffRecharge.recharge_seconds,
            tariffRecharge.recharged_at,
            tariffRecharge.remaining_seconds_before_recharge,
            tariffRecharge.tariff_id,
            tariffRecharge.user_id,
        ];

        return {
            text: builder.getQueryString(),
            params: params,
        };
    }

    private getReturningColumnNames(): ColumnName[] {
        const returningColumnNames: ColumnName[] = [
            ColumnName.id,
            ColumnName.recharge_price,
            ColumnName.recharge_seconds,
            ColumnName.recharged_at,
            ColumnName.remaining_seconds_before_recharge,
            ColumnName.tariff_id,
            ColumnName.user_id,
        ];
        return returningColumnNames;
    }

    private createInsertQueryBuilder(): InsertQueryBuilder {
        return new InsertQueryBuilder();
    }
}

enum ColumnName {
    id = 'id',
    tariff_id = 'tariff_id',
    remaining_seconds_before_recharge = 'remaining_seconds_before_recharge',
    recharge_seconds = 'recharge_seconds',
    recharge_price = 'recharge_price',
    user_id = 'user_id',
    recharged_at = 'recharged_at',
}

enum TableName {
    tariff_recharge = 'tariff_recharge',
}
