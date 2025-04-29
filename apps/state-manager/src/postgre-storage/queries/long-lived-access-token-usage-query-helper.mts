import { ILongLivedAccessTokenUsage } from 'src/storage/entities/long-lived-access-token-usage.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { InsertQueryBuilder } from './query-builder.mjs';

export class LongLivedAccessTokenUsageQueryHelper {
    addLongLivedAccessTokenUsage(longLivedAccessTokenUsage: ILongLivedAccessTokenUsage): IQueryTextWithParamsResult {
        const builder = new InsertQueryBuilder();
        const insertColumnNames = this.getAllColumnNames().filter(x => x !== ColumnName.id);
        builder.setTableName(TableName.long_lived_access_token_usage);
        builder.addManyInsertColumnNames(insertColumnNames);
        builder.addReturningColumnNames(this.getAllColumnNames());
        const params = [
            longLivedAccessTokenUsage.token,
            longLivedAccessTokenUsage.used_at,
            longLivedAccessTokenUsage.valid_to,
            longLivedAccessTokenUsage.device_id,
            longLivedAccessTokenUsage.user_id,
            longLivedAccessTokenUsage.tariff_id,
            longLivedAccessTokenUsage.ip_address,
        ];
        return {
            text: builder.getQueryString(),
            params: params,
        };
    }

    private getAllColumnNames(): ColumnName[] {
        return [
            ColumnName.id,
            ColumnName.token,
            ColumnName.used_at,
            ColumnName.valid_to,
            ColumnName.device_id,
            ColumnName.user_id,
            ColumnName.tariff_id,
            ColumnName.ip_address,
        ];
    }
}

const enum TableName {
    long_lived_access_token_usage = 'long_lived_access_token_usage',
}

const enum ColumnName {
    id = 'id',
    token = 'token',
    used_at = 'used_at',
    valid_to = 'valid_to',
    device_id = 'device_id',
    user_id = 'user_id',
    tariff_id = 'tariff_id',
    ip_address = 'ip_address',
}
