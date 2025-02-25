import { IDeviceStatus, IDeviceStatusWithContinuationData } from 'src/storage/entities/device-status.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { IDeviceSession } from 'src/storage/entities/device-session.mjs';
import { TariffType } from '@computerclubsystem/types/entities/tariff.mjs';

export class DeviceStatusQueryHelper {
    setDeviceStatusNoteQueryData(deviceId: number, note: string | null): IQueryTextWithParamsResult {
        const params = [
            note,
            deviceId,
        ];
        return {
            text: this.setDeviceStatusNoteQueryText,
            params: params,
        };
    }

    private readonly setDeviceStatusNoteQueryText = `
        UPDATE device_status
        SET note = $1
        WHERE device_id = $2
    `;

    getDeviceStatusesSummaryForStartedDevicesQueryData(tariffTypes: TariffType[]): IQueryTextWithParamsResult {
        const params = [
            tariffTypes,
        ];
        return {
            text: this.getDeviceStatusesSummaryForStartedDevicesQueryText,
            params: params,
        };
    }

    private readonly getDeviceStatusesSummaryForStartedDevicesQueryText = `
        SELECT
        SUM(total) AS total,
        COUNT(*)::int AS count
        FROM device_status
        WHERE started = true
    `;

    getDeviceStatusesByTariffIdQuery(tariffId: number): IQueryTextWithParamsResult {
        const params = [
            tariffId,
        ];
        return {
            text: this.getDeviceStatusesByTariffIdQueryText,
            params: params,
        };
    }

    private readonly getDeviceStatusesByTariffIdQueryText = `
        SELECT 
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled,
            started_by_user_id,
            stopped_by_user_id,
            note
        FROM device_status
        WHERE start_reason = $1
    `;

    completeDeviceStatusUpdateQuery(deviceStatus: IDeviceStatusWithContinuationData, deviceSession: IDeviceSession): IQueryTextWithParamsResult {
        const params = [
            deviceStatus.started,
            deviceStatus.start_reason,
            deviceStatus.started_at,
            deviceStatus.stopped_at,
            deviceStatus.total,
            deviceStatus.enabled,
            deviceStatus.started_by_user_id,
            deviceStatus.stopped_by_user_id,
            deviceStatus.device_id,

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
            text: this.completeDeviceStatusUpdateQueryText,
            params: params,
        };
    }

    private readonly completeDeviceStatusUpdateQueryText = `
        UPDATE device_status
        SET started = $1,
            start_reason = $2,
            started_at = $3,
            stopped_at = $4,
            total = $5,
            enabled = $6,
            started_by_user_id = $7,
            stopped_by_user_id = $8
        WHERE device_id = $9;

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
            $10,
            $11,
            $12,
            $13,
            $14,
            $15,
            $16,
            $17,
            $18,
            $19
        );
    `;

    updateDeviceStatusQuery(deviceStatus: IDeviceStatus): IQueryTextWithParamsResult {
        const params = [
            deviceStatus.started,
            deviceStatus.start_reason,
            deviceStatus.started_at,
            deviceStatus.stopped_at,
            deviceStatus.total,
            deviceStatus.enabled,
            deviceStatus.started_by_user_id,
            deviceStatus.stopped_by_user_id,
            deviceStatus.note,
            deviceStatus.device_id,
        ];
        return {
            text: this.updateDeviceStatusQueryText,
            params: params,
        };
    }

    addOrUpdateDeviceStatusEnabledQuery(deviceStatus: IDeviceStatus): IQueryTextWithParamsResult {
        const params = [
            deviceStatus.device_id,
            deviceStatus.started,
            deviceStatus.start_reason,
            deviceStatus.started_at,
            deviceStatus.stopped_at,
            deviceStatus.total,
            deviceStatus.enabled,
            deviceStatus.started_by_user_id,
            deviceStatus.stopped_by_user_id,
            deviceStatus.note,
        ];
        return {
            text: this.addDeviceStatusQueryText,
            params,
        };
    }

    getDeviceStatusQuery(deviceId: number): IQueryTextWithParamsResult {
        const params: [
            number
        ] = [
                deviceId,
            ];
        return {
            text: this.getDeviceStatusQueryText,
            params,
        };
    }

    // setDeviceStatusEnabledFlagQuery(deviceId: number, enabled: boolean): IQueryTextWithParamsResult {
    //     const params: [
    //         boolean,
    //         number,
    //     ] = [
    //         enabled,
    //         deviceId,
    //         ];
    //     return {
    //         text: this.setDeviceStatusEnabledFlagQueryText,
    //         params: params,
    //     };
    // }

    // private readonly setDeviceStatusEnabledFlagQueryText = `
    //     UPDATE device_status
    //     SET enabled = $1
    //     WHERE device_id = $2
    // `;

    private readonly updateDeviceStatusQueryText = `
        UPDATE device_status
        SET started = $1,
            start_reason = $2,
            started_at = $3,
            stopped_at = $4,
            total = $5,
            enabled = $6,
            started_by_user_id = $7,
            stopped_by_user_id = $8,
            note = $9
        WHERE device_id = $10
        RETURNING
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled,
            started_by_user_id,
            stopped_by_user_id,
            note
    `;

    private readonly addDeviceStatusQueryText = `
        INSERT INTO device_status 
        (
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled,
            started_by_user_id,
            stopped_by_user_id,
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
        ON CONFLICT (device_id) DO
            UPDATE SET enabled = $7
    `;

    public readonly getAllDeviceStatusesWithContinuationDataQueryText = `
        SELECT 
            d.device_id,
            d.started,
            d.start_reason,
            d.started_at,
            d.stopped_at,
            d.total,
            d.enabled,
            d.started_by_user_id,
            d.stopped_by_user_id,
            d.note,
            dc.tariff_id AS continuation_tariff_id,
            dc.user_id AS continuation_user_id
        FROM device_status AS d
        LEFT JOIN device_continuation AS dc
             ON dc.device_id = d.device_id
    `;

    public readonly getAllDeviceStatusesQueryText = `
        SELECT 
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled,
            started_by_user_id,
            stopped_by_user_id,
            note
        FROM device_status
    `;

    private readonly getDeviceStatusQueryText = `
        SELECT 
            device_id,
            started,
            start_reason,
            started_at,
            stopped_at,
            total,
            enabled,
            started_by_user_id,
            stopped_by_user_id,
            note
        FROM device_status
        WHERE device_id = $1
    `;
}
