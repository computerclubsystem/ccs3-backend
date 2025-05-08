import { ILongLivedAccessToken } from 'src/storage/entities/long-lived-access-token.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder, WhereClauseOperation } from './query-builder.mjs';

export class LongLivedAccessTokenQueryHelper {
    updateLongLivedTokenValidTo(longLivedAccessTokenId: number, validTo: string): IQueryTextWithParamsResult {
        const builder = new UpdateQueryBuilder();
        builder.setTableName(TableName.long_lived_access_token);
        builder.addUpdateColumnNameWithValue(ColumnName.valid_to, validTo);
        builder.addWhereParameterColumnNameWithValue(ColumnName.id, longLivedAccessTokenId);
        return {
            text: builder.getQueryString(),
            params: builder.getParameterValues(),
        };
    }

    getLongLivedAccessToken(token: string): IQueryTextWithParamsResult {
        const builder = new SelectQueryBuilder();
        builder.setTableName(TableName.long_lived_access_token);
        const colNames = this.getAllColumnNames();
        builder.addSelectColumnNames(colNames);
        builder.addWhereClause({ columnName: ColumnName.token, operation: WhereClauseOperation.equals, parameterName: '$1' });
        const params = [
            token,
        ];
        return {
            text: builder.getQueryString(),
            params: params,
        };
    }

    setLongLivedAccessToken(longLivedAccessToken: ILongLivedAccessToken): IQueryTextWithParamsResult {
        const builder = new InsertQueryBuilder();
        const insertColumnNames = this.getAllColumnNames().filter(x => x !== ColumnName.id);
        builder.setTableName(TableName.long_lived_access_token);
        builder.addManyInsertColumnNames(insertColumnNames);
        builder.addReturningColumnNames(this.getAllColumnNames());
        const params = [
            longLivedAccessToken.token,
            longLivedAccessToken.issued_at,
            longLivedAccessToken.valid_to,
            longLivedAccessToken.user_id,
            longLivedAccessToken.tariff_id,
        ];
        return {
            text: builder.getQueryString(),
            params: params,
        };
    }

    deleteLongLivedAccessTokensByTari9ffId(tariffId: number): IQueryTextWithParamsResult {
        const params = [
            tariffId,
        ];
        return {
            text: this.deleteLongLivedAccessTokensByTariffIdQueryText,
            params: params,
        };
    }

    private readonly deleteLongLivedAccessTokensByTariffIdQueryText = `
        DELETE FROM long_lived_access_token
        WHERE tariff_id = $1
    `;

    deleteLongLivedAccessTokensByUserId(userId: number): IQueryTextWithParamsResult {
        const params = [
            userId,
        ];
        return {
            text: this.deleteLongLivedAccessTokensByUserIdQueryText,
            params: params,
        };
    }

    private readonly deleteLongLivedAccessTokensByUserIdQueryText = `
        DELETE FROM long_lived_access_token
        WHERE user_id = $1
    `;

    private getAllColumnNames(): ColumnName[] {
        return [
            ColumnName.id,
            ColumnName.token,
            ColumnName.issued_at,
            ColumnName.valid_to,
            ColumnName.user_id,
            ColumnName.tariff_id,
        ];
    }
}

enum TableName {
    long_lived_access_token = 'long_lived_access_token',
}

enum ColumnName {
    id = 'id',
    token = 'token',
    issued_at = 'issued_at',
    valid_to = 'valid_to',
    user_id = 'user_id',
    tariff_id = 'tariff_id',
}