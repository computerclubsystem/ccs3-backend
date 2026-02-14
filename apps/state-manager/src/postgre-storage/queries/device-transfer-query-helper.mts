import { IDeviceStatus } from 'src/storage/entities/device-status.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { InsertQueryBuilder } from './query-builder.mjs';
import { ValueOf } from '@computerclubsystem/types/declarations.mjs';

export class DeviceTransferQueryHelper {
    addDeviceTransferQueryData(
        sourceDeviceStatus: IDeviceStatus,
        targetDeviceStatus: IDeviceStatus,
        transferredByUserId: number | null,
        transferredAt: string,
    ): IQueryTextWithParamsResult {
        const builder = new InsertQueryBuilder();
        const insertColumnNames = this.getAllColumnNames().filter(x => x !== ColumnName.id);
        builder.setTableName(TableName.device_transfer);
        builder.addManyInsertColumnNames(insertColumnNames);
        builder.addReturningColumnNames(this.getAllColumnNames());
        const params = [
            sourceDeviceStatus.device_id,
            targetDeviceStatus.device_id,
            sourceDeviceStatus.start_reason,
            sourceDeviceStatus.started_at,
            sourceDeviceStatus.total,
            sourceDeviceStatus.started_by_user_id,
            transferredByUserId,
            sourceDeviceStatus.note,
            targetDeviceStatus.note,
            transferredAt,
        ];
        return {
            text: builder.getQueryString(),
            params: params,
        };
    }

    private getAllColumnNames(): ColumnName[] {
        return [
            ColumnName.id,
            ColumnName.source_device_id,
            ColumnName.target_device_id,
            ColumnName.start_reason,
            ColumnName.started_at,
            ColumnName.total,
            ColumnName.started_by_user_id,
            ColumnName.transferred_by_user_id,
            ColumnName.source_note,
            ColumnName.target_note,
            ColumnName.transferred_at,
        ];
    }
}

const TableName = {
    device_transfer: 'device_transfer',
} as const;
export type TableName = ValueOf<typeof TableName>;

const ColumnName = {
    id: 'id',
    source_device_id: 'source_device_id',
    target_device_id: 'target_device_id',
    start_reason: 'start_reason',
    started_at: 'started_at',
    total: 'total',
    started_by_user_id: 'started_by_user_id',
    transferred_by_user_id: 'transferred_by_user_id',
    source_note: 'source_note',
    target_note: 'target_note',
    transferred_at: 'transferred_at',
} as const;
export type ColumnName = ValueOf<typeof ColumnName>;