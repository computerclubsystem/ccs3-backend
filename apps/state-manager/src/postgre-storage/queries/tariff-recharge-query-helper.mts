import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { InsertQueryBuilder, SelectQueryBuilder, WhereClauseOperation } from './query-builder.mjs';
import { ITariffRecharge } from 'src/storage/entities/tariff-recharge.mjs';
import { ValueOf } from '@computerclubsystem/types/declarations.mjs';

export class TariffRechargeQueryHelper {
    getRechargedTariffsForDateTimeInterval(fromDate: string | undefined | null, toDate: string): IQueryTextWithParamsResult {
        const builder = new SelectQueryBuilder();
        builder.setTableName(TableName.tariff_recharge);
        builder.addSelectColumnNames(this.getReturningColumnNames());
        const params: unknown[] = [];
        let paramNumber = 0;
        if (fromDate) {
            paramNumber++;
            builder.addWhereClause({ columnName: ColumnName.recharged_at, operation: WhereClauseOperation.greaterThan, parameterName: `$${paramNumber}` });
            params.push(fromDate);
        }
        paramNumber++;
        builder.addWhereClause({ columnName: ColumnName.recharged_at, operation: WhereClauseOperation.lessThan, parameterName: `$${paramNumber}` });
        params.push(toDate);
        return {
            text: builder.getQueryString(),
            params: params
        };
    }

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

const TableName = {
    tariff_recharge: 'tariff_recharge',
} as const;
export type TableName = ValueOf<typeof TableName>;

const ColumnName = {
    id: 'id',
    tariff_id: 'tariff_id',
    remaining_seconds_before_recharge: 'remaining_seconds_before_recharge',
    recharge_seconds: 'recharge_seconds',
    recharge_price: 'recharge_price',
    user_id: 'user_id',
    recharged_at: 'recharged_at',
} as const;
export type ColumnName = ValueOf<typeof ColumnName>;

