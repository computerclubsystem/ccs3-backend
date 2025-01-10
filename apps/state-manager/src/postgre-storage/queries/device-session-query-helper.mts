import { IDeviceSession } from 'src/storage/entities/device-session.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';

export class DeviceSessionQueryHelper {
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
}
