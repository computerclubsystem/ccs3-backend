import { IShift } from 'src/storage/entities/shift.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { SelectQueryBuilder, SortOrder, WhereClauseOperation } from './query-builder.mjs';

export class ShiftQueryHelper {
    getShiftsSummaryQueryData(fromDate: string, toDate: string, userId: number | null | undefined): IQueryTextWithParamsResult {
        const params: unknown[] = [
            fromDate,
            toDate,
        ];
        let queryText = this.getShiftsSummaryQueryText;
        if (userId) {
            params.push(userId);
            queryText += ' AND user_id = $3';
        }
        return {
            text: queryText,
            params: params,
        };
    }

    private readonly getShiftsSummaryQueryText = `
        SELECT
            SUM(total_amount) AS total_amount,
            SUM(completed_sessions_total) AS completed_sessions_total,
            SUM(completed_sessions_count)::int AS completed_sessions_count,
            SUM(running_sessions_total) AS running_sessions_total,
            SUM(running_sessions_count)::int AS running_sessions_count,
            SUM(continuations_total) AS continuations_total,
            SUM(continuations_count)::int AS continuations_count,
            SUM(created_prepaid_tariffs_total) AS created_prepaid_tariffs_total,
            SUM(created_prepaid_tariffs_count)::int AS created_prepaid_tariffs_count,
            SUM(recharged_prepaid_tariffs_total) AS recharged_prepaid_tariffs_total,
            SUM(recharged_prepaid_tariffs_count)::int AS recharged_prepaid_tariffs_count
        FROM shift
        WHERE completed_at > $1 AND completed_at < $2
    `;

    getShiftsQueryData(fromDate: string, toDate: string, userId: number | null | undefined): IQueryTextWithParamsResult {
        const selectBuilder = new SelectQueryBuilder();
        selectBuilder.setTableName(TableName.shift);
        selectBuilder.addSelectColumnNames(this.getColumnNames());
        selectBuilder.addWhereClause({
            columnName: ColumnName.completed_at,
            operation: WhereClauseOperation.greaterThan,
            parameterName: '$1',
        });
        selectBuilder.addWhereClause({
            columnName: ColumnName.completed_at,
            operation: WhereClauseOperation.lessThanOrEqual,
            parameterName: '$2',
        });
        if (userId) {
            selectBuilder.addWhereClause({
                columnName: ColumnName.user_id,
                operation: WhereClauseOperation.equals,
                parameterName: '$3',
            });
        }
        const params: unknown[] = [
            fromDate,
            toDate,
        ];
        if (userId) {
            params.push(userId);
        }
        selectBuilder.addOrderClause({ columnName: ColumnName.completed_at, sortOrder: SortOrder.descending });
        return {
            text: selectBuilder.getQueryString(),
            params: params,
        };
    }

    addShiftQueryData(shift: IShift): IQueryTextWithParamsResult {
        const params = [
            shift.user_id,
            shift.completed_sessions_total,
            shift.completed_sessions_count,
            shift.running_sessions_total,
            shift.running_sessions_count,
            shift.continuations_total,
            shift.continuations_count,
            shift.created_prepaid_tariffs_total,
            shift.created_prepaid_tariffs_count,
            shift.recharged_prepaid_tariffs_total,
            shift.recharged_prepaid_tariffs_count,
            shift.total_amount,
            shift.completed_at,
            shift.note,
        ];
        return {
            text: this.addShiftQueryText,
            params: params,
        };
    }

    private readonly addShiftQueryText = `
        INSERT INTO shift
        (
            user_id,
            completed_sessions_total,
            completed_sessions_count,
            running_sessions_total,
            running_sessions_count,
            continuations_total,
            continuations_count,
            created_prepaid_tariffs_total,
            created_prepaid_tariffs_count,
            recharged_prepaid_tariffs_total,
            recharged_prepaid_tariffs_count,
            total_amount,
            completed_at,
            note
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14
        )
        RETURNING
            id,
            user_id,
            completed_sessions_total,
            completed_sessions_count,
            running_sessions_total,
            running_sessions_count,
            continuations_total,
            continuations_count,
            created_prepaid_tariffs_total,
            created_prepaid_tariffs_count,
            recharged_prepaid_tariffs_total,
            recharged_prepaid_tariffs_count,
            total_amount,
            completed_at,
            note
    `;

    getLastShiftQueryData(): IQueryTextWithParamsResult {
        return {
            text: this.getLastShiftQueryText,
            params: undefined,
        };
    }

    private readonly getLastShiftQueryText = `
        SELECT * FROM shift
        WHERE id = (SELECT MAX(id) FROM shift)
    `;

    private getColumnNames(): ColumnName[] {
        const colNames: ColumnName[] = [
            ColumnName.id,
            ColumnName.user_id,
            ColumnName.completed_sessions_total,
            ColumnName.completed_sessions_count,
            ColumnName.running_sessions_total,
            ColumnName.running_sessions_count,
            ColumnName.continuations_total,
            ColumnName.continuations_count,
            ColumnName.created_prepaid_tariffs_total,
            ColumnName.created_prepaid_tariffs_count,
            ColumnName.recharged_prepaid_tariffs_total,
            ColumnName.recharged_prepaid_tariffs_count,
            ColumnName.total_amount,
            ColumnName.completed_at,
            ColumnName.note,
        ];
        return colNames;
    }
}

const enum TableName {
    shift = 'shift',
}

const enum ColumnName {
    id = 'id',
    user_id = 'user_id',
    completed_sessions_total = 'completed_sessions_total',
    completed_sessions_count = 'completed_sessions_count',
    running_sessions_total = 'running_sessions_total',
    running_sessions_count = 'running_sessions_count',
    continuations_total = 'continuations_total',
    continuations_count = 'continuations_count',
    created_prepaid_tariffs_total = 'created_prepaid_tariffs_total',
    created_prepaid_tariffs_count = 'created_prepaid_tariffs_count',
    recharged_prepaid_tariffs_total = 'recharged_prepaid_tariffs_total',
    recharged_prepaid_tariffs_count = 'recharged_prepaid_tariffs_count',
    total_amount = 'total_amount',
    completed_at = 'completed_at',
    note = 'note',
}
