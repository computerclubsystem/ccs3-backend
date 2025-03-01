import { TariffType } from '@computerclubsystem/types/entities/tariff.mjs';
import { IDeviceSession } from 'src/storage/entities/device-session.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { SelectQueryBuilder, WhereClauseOperation } from './query-builder.mjs';

export class DeviceSessionQueryHelper {
    getCompletedSessionsQueryData(fromDate: string | null | undefined, toDate: string): IQueryTextWithParamsResult {
        const params: unknown[] = [];
        const builder = new SelectQueryBuilder();
        builder.setTableName(TableName.device_session);
        builder.addSelectColumnNames(this.getAllColumnNames());
        if (fromDate) {
            params.push(fromDate);
            params.push(toDate);
            builder.addWhereClause({
                columnName: ColumnName.stopped_at,
                operation: WhereClauseOperation.greaterThan,
                parameterName: '$1'
            });
            builder.addWhereClause({
                columnName: ColumnName.stopped_at,
                operation: WhereClauseOperation.lessThan,
                parameterName: '$2'
            });
        } else {
            params.push(toDate);
            builder.addWhereClause({
                columnName: ColumnName.stopped_at,
                operation: WhereClauseOperation.lessThan,
                parameterName: '$1'
            });
        }
        return {
            text: builder.getQueryString(),
            params: params,
        };
    }

    getCompletedSessionsSummaryQueryData(fromDate: string | null | undefined, toDate: string): IQueryTextWithParamsResult {
        const params: unknown[] = [];
        let getCompletedSessionsSummaryQueryText = `
            SELECT
                SUM(total_amount) AS total,
                COUNT(*)::int AS count
            FROM device_session
        `;
        if (fromDate) {
            params.push(fromDate);
            params.push(toDate);
            getCompletedSessionsSummaryQueryText += `
                WHERE stopped_at > $1 AND stopped_at < $2
            `;
        } else {
            params.push(toDate);
            getCompletedSessionsSummaryQueryText += `
            WHERE stopped_at < $1
        `;
        }
        return {
            text: getCompletedSessionsSummaryQueryText,
            params: params,
        };
    }

    getDeviceSessionsSummaryStoppedSinceDateQueryData(stoppedSinceDate: string, tariffTypes: TariffType[]): IQueryTextWithParamsResult {
        const params = [
            stoppedSinceDate,
            tariffTypes,
        ];
        return {
            text: this.getDeviceSessionsSummaryStoppedSinceQueryText,
            params: params,
        };
    }

    private readonly getDeviceSessionsSummaryStoppedSinceQueryText = `
        SELECT
        SUM(total_amount) AS total,
            COUNT(*)::int AS count
        FROM device_session
        WHERE stopped_at > $1
            AND tariff_id = ANY($2)
    `;

    addDeviceSessionQueryData(deviceSession: IDeviceSession): IQueryTextWithParamsResult {
        const params = [
            deviceSession.device_id,
            deviceSession.tariff_id,
            deviceSession.total_amount,
            deviceSession.started_at,
            deviceSession.stopped_at,
            deviceSession.started_by_user_id,
            deviceSession.stopped_by_user_id,
            deviceSession.started_by_customer,
            deviceSession.stopped_by_customer,
            deviceSession.note,
        ];
        return {
            text: this.addDeviceSessionQueryText,
            params: params,
        };
    }

    private readonly returningQueryText = `
        RETURNING
            id,
            device_id,
            tariff_id,
            total_amount,
            started_at,
            stopped_at,
            started_by_user_id,
            stopped_by_user_id,
            started_by_customer,
            stopped_by_customer,
            note
    `;

    private readonly addDeviceSessionQueryText = `
        INSERT INTO device_session
        (
            device_id,
            tariff_id,
            total_amount,
            started_at,
            stopped_at,
            started_by_user_id,
            stopped_by_user_id,
            started_by_customer,
            stopped_by_customer,
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
            $10
        )
        ${this.returningQueryText}
    `;

    private getAllColumnNames(): ColumnName[] {
        return [
            ColumnName.id,
            ColumnName.device_id,
            ColumnName.tariff_id,
            ColumnName.total_amount,
            ColumnName.started_at,
            ColumnName.stopped_at,
            ColumnName.started_by_user_id,
            ColumnName.stopped_by_user_id,
            ColumnName.started_by_customer,
            ColumnName.stopped_by_customer,
            ColumnName.note,
        ];
    }
}

const enum TableName {
    device_session = 'device_session',
}

const enum ColumnName {
    id = 'id',
    device_id = 'device_id',
    tariff_id = 'tariff_id',
    total_amount = 'total_amount',
    started_at = 'started_at',
    stopped_at = 'stopped_at',
    started_by_user_id = 'started_by_user_id',
    stopped_by_user_id = 'stopped_by_user_id',
    started_by_customer = 'started_by_customer',
    stopped_by_customer = 'stopped_by_customer',
    note = 'note',
}