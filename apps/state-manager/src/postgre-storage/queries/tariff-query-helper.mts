import { ITariff } from 'src/storage/entities/tariff.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder, WhereClauseOperation } from './query-builder.mjs';

export class TariffQueryHelper {
    private returningQueryText = `
        RETURNING
            id,
            name,
            description,
            type,
            duration,
            from_time,
            to_time,
            price,
            enabled,
            created_at,
            updated_at,
            restrict_start_time,
            restrict_start_from_time,
            restrict_start_to_time,
            remaining_seconds,
            can_be_started_by_customer,
            created_by_user_id,
            updated_by_user_id
    `;

    getCreatedTariffsForDateTimeInterval(fromDate: string | undefined | null, toDate: string): IQueryTextWithParamsResult {
        const builder = new SelectQueryBuilder();
        builder.setTableName(TableName.tariff);
        builder.addSelectColumnNames(this.getReturningColumnNames());
        const params: unknown[] = [];
        let paramNumber = 0;
        if (fromDate) {
            paramNumber++;
            builder.addWhereClause({ columnName: ColumnName.created_at, operation: WhereClauseOperation.greaterThan, parameterName: `$${paramNumber}` });
            params.push(fromDate);
        }
        paramNumber++;
        builder.addWhereClause({ columnName: ColumnName.created_at, operation: WhereClauseOperation.lessThan, parameterName: `$${paramNumber}` });
        params.push(toDate);
        return {
            text: builder.getQueryString(),
            params: params
        };
    }

    checkTariffPasswordHashQueryData(tariffId: number, passwordHash: string): IQueryTextWithParamsResult {
        const params = [
            tariffId,
            passwordHash,
        ];
        return {
            text: this.checkTariffPasswordHashQueryText,
            params: params,
        };
    }

    private readonly checkTariffPasswordHashQueryText = `
        SELECT id
        FROM tariff
        WHERE id = $1 AND password_hash = $2
    `;

    getAllTariffsQueryData(types?: number[]): IQueryTextWithParamsResult {
        let params: unknown[] | undefined = undefined;
        let queryTextWhere = '';
        if (types?.length) {
            params = [
                types,
            ];
            queryTextWhere = 'WHERE type = ANY($1)'
        }
        return {
            text: this.getAllTariffsQueryText + ' ' + queryTextWhere,
            params: params,
        }
    }

    getTariffByIdQueryData(tariffId: number): IQueryTextWithParamsResult {
        const params = [
            tariffId,
        ];
        return {
            text: this.getTariffByIdQueryText,
            params: params,
        };
    }

    increaseTariffRemainingSecondsQueryData(
        tariffId: number,
        secondsToAdd: number,
        increasedAt: string,
        userId: number
    ): IQueryTextWithParamsResult {
        const params = [
            tariffId,
            secondsToAdd,
            increasedAt,
            userId,
        ];
        return {
            text: this.increaseTariffRemainingSecondsQueryText,
            params: params,
        };
    }

    private readonly increaseTariffRemainingSecondsQueryText = `
        UPDATE tariff
        SET
            remaining_seconds = remaining_seconds + $2,
            updated_at = $3,
            updated_by_user_id = $4
        WHERE id = $1
        ${this.returningQueryText}
    `;

    updateTariffPasswordHashQueryData(tariffId: number, passwordHash: string): IQueryTextWithParamsResult {
        const builder = this.createUpdateQueryBuilder();
        builder.setTableName(TableName.tariff);
        builder.addUpdateColumnNameWithValue(ColumnName.password_hash, passwordHash);
        builder.addWhereParameterColumnNameWithValue(ColumnName.id, tariffId);
        builder.addReturningColumnNames(this.getReturningColumnNames());
        const result: IQueryTextWithParamsResult = {
            text: builder.getQueryString(),
            params: builder.getParameterValues(),
        };
        return result;
    }

    updateTariffRemainingSecondsQueryData(tariffId: number, remainingSeconds: number): IQueryTextWithParamsResult {
        const builder = this.createUpdateQueryBuilder();
        builder.setTableName(TableName.tariff);
        builder.addUpdateColumnNameWithValue(ColumnName.remaining_seconds, remainingSeconds);
        builder.addWhereParameterColumnNameWithValue(ColumnName.id, tariffId);
        builder.addReturningColumnNames(this.getReturningColumnNames());
        const result: IQueryTextWithParamsResult = {
            text: builder.getQueryString(),
            params: builder.getParameterValues(),
        };
        return result;
    }

    updateTariffQueryData(tariff: ITariff, passwordHash?: string): IQueryTextWithParamsResult {
        const builder = this.createUpdateQueryBuilder();
        builder.setTableName(TableName.tariff);
        builder.addUpdateColumnNameWithValue(ColumnName.name, tariff.name);
        builder.addUpdateColumnNameWithValue(ColumnName.description, tariff.description);
        builder.addUpdateColumnNameWithValue(ColumnName.duration, tariff.duration);
        builder.addUpdateColumnNameWithValue(ColumnName.enabled, tariff.enabled);
        builder.addUpdateColumnNameWithValue(ColumnName.from_time, tariff.from_time);
        builder.addUpdateColumnNameWithValue(ColumnName.to_time, tariff.to_time);
        builder.addUpdateColumnNameWithValue(ColumnName.price, tariff.price);
        builder.addUpdateColumnNameWithValue(ColumnName.updated_at, tariff.updated_at);
        builder.addUpdateColumnNameWithValue(ColumnName.restrict_start_time, tariff.restrict_start_time);
        builder.addUpdateColumnNameWithValue(ColumnName.restrict_start_from_time, tariff.restrict_start_from_time);
        builder.addUpdateColumnNameWithValue(ColumnName.restrict_start_to_time, tariff.restrict_start_to_time);
        builder.addUpdateColumnNameWithValue(ColumnName.can_be_started_by_customer, tariff.can_be_started_by_customer);
        builder.addUpdateColumnNameWithValue(ColumnName.updated_by_user_id, tariff.updated_by_user_id);
        // remaining_seconds are updated only as result of calculations
        // builder.addUpdateColumnNameWithValue(ColumnName.remaining_seconds, tariff.remaining_seconds);
        if (passwordHash) {
            builder.addUpdateColumnNameWithValue(ColumnName.password_hash, passwordHash);
        }
        builder.addWhereParameterColumnNameWithValue(ColumnName.id, tariff.id);
        // const returningColumnNames = [ColumnName.id, ...builder.getUpdateColumnsWithValues().map(x => x.columnName)]
        //     .filter(x => x !== ColumnName.password_hash);
        builder.addReturningColumnNames(this.getReturningColumnNames());
        const result: IQueryTextWithParamsResult = {
            text: builder.getQueryString(),
            params: builder.getParameterValues(),
        };
        return result;
    }

    createTariffQueryData(tariff: ITariff, passwordHash?: string): IQueryTextWithParamsResult {
        const builder = this.createInsertQueryBuilder();
        builder.setTableName(TableName.tariff);
        const insertColumnNames = [
            ColumnName.name,
            ColumnName.description,
            ColumnName.type,
            ColumnName.duration,
            ColumnName.from_time,
            ColumnName.to_time,
            ColumnName.price,
            ColumnName.enabled,
            ColumnName.created_at,
            ColumnName.restrict_start_time,
            ColumnName.restrict_start_from_time,
            ColumnName.restrict_start_to_time,
            ColumnName.can_be_started_by_customer,
            ColumnName.remaining_seconds,
            ColumnName.created_by_user_id,
            ColumnName.updated_by_user_id,
        ];
        const params = [
            tariff.name,
            tariff.description,
            tariff.type,
            tariff.duration,
            tariff.from_time,
            tariff.to_time,
            tariff.price,
            tariff.enabled,
            tariff.created_at,
            tariff.restrict_start_time,
            tariff.restrict_start_from_time,
            tariff.restrict_start_to_time,
            tariff.can_be_started_by_customer,
            tariff.remaining_seconds,
            tariff.created_by_user_id,
            tariff.updated_by_user_id,
        ];
        const returningColumnNames = [ColumnName.id, ...insertColumnNames];
        if (passwordHash) {
            insertColumnNames.push(ColumnName.password_hash);
            params.push(passwordHash);
        }
        builder.addManyInsertColumnNames(insertColumnNames);
        builder.addReturningColumnNames(returningColumnNames);
        const queryText = builder.getQueryString();
        return {
            text: queryText,
            params: params,
        }
    }

    private getReturningColumnNames(): ColumnName[] {
        const returningColumnNames = [
            ColumnName.can_be_started_by_customer,
            ColumnName.created_at,
            ColumnName.description,
            ColumnName.duration,
            ColumnName.enabled,
            ColumnName.from_time,
            ColumnName.id,
            ColumnName.name,
            ColumnName.price,
            ColumnName.remaining_seconds,
            ColumnName.restrict_start_from_time,
            ColumnName.restrict_start_time,
            ColumnName.restrict_start_to_time,
            ColumnName.to_time,
            ColumnName.type,
            ColumnName.updated_at,
            ColumnName.created_by_user_id,
            ColumnName.updated_by_user_id,
        ];
        return returningColumnNames;
    }

    // private readonly updateTariffQueryText = `
    //     UPDATE tariff
    //     SET name = $1,
    //         description = $2,
    //         type = $3,
    //         duration = $4,
    //         from_time = $5,
    //         to_time = $6,
    //         price = $7,
    //         enabled = $8,
    //         updated_at = $9,
    //         restrict_start_time = $10,
    //         restrict_start_from_time = $11,
    //         restrict_start_to_time = $12,
    //         can_be_started_by_customer = $13
    //     WHERE id = $14
    //     ${this.returningQueryText}
    // `;

    private readonly getAllTariffsQueryText = `
        SELECT
            id,
            name,
            description,
            type,
            duration,
            from_time,
            to_time,
            price,
            enabled,
            created_at,
            updated_at,
            restrict_start_time,
            restrict_start_from_time,
            restrict_start_to_time,
            remaining_seconds,
            can_be_started_by_customer,
            created_by_user_id,
            updated_by_user_id
        FROM tariff
    `;

    public readonly getTariffByIdQueryText = `
        SELECT
            id,
            name,
            description,
            type,
            duration,
            from_time,
            to_time,
            price,
            enabled,
            created_at,
            updated_at,
            restrict_start_time,
            restrict_start_from_time,
            restrict_start_to_time,
            remaining_seconds,
            can_be_started_by_customer,
            created_by_user_id,
            updated_by_user_id
        FROM tariff
        WHERE id = $1
    `;

    private createSelectQueryBuilder(): SelectQueryBuilder {
        return new SelectQueryBuilder();
    }

    private createInsertQueryBuilder(): InsertQueryBuilder {
        return new InsertQueryBuilder();
    }

    private createUpdateQueryBuilder(): UpdateQueryBuilder {
        return new UpdateQueryBuilder();
    }
}

enum ColumnName {
    id = 'id',
    name = 'name',
    description = 'description',
    type = 'type',
    duration = 'duration',
    from_time = 'from_time',
    to_time = 'to_time',
    price = 'price',
    enabled = 'enabled',
    created_at = 'created_at',
    updated_at = 'updated_at',
    restrict_start_time = 'restrict_start_time',
    restrict_start_from_time = 'restrict_start_from_time',
    restrict_start_to_time = 'restrict_start_to_time',
    remaining_seconds = 'remaining_seconds',
    can_be_started_by_customer = 'can_be_started_by_customer',
    password_hash = 'password_hash',
    created_by_user_id = 'created_by_user_id',
    updated_by_user_id = 'updated_by_user_id',
}

enum TableName {
    tariff = 'tariff',
}
