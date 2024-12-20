import { IDeviceConnectionEvent } from 'src/storage/entities/device-connection-event.mjs';
import { IQueryTextWithParamsResult } from './query-with-params.mjs';
import { DeviceConnectionEventType } from 'src/storage/entities/constants/device-connection-event-type.mjs';

export class DeviceConnectionQueryHelper {
    addDeviceConnectionQueryData(deviceConnection: IDeviceConnectionEvent): IQueryTextWithParamsResult {
        const params: [
            number,
            string | undefined,
            DeviceConnectionEventType,
            string | undefined,
            string
        ] = [
                deviceConnection.device_id,
                deviceConnection.ip_address,
                deviceConnection.type,
                deviceConnection.note,
                deviceConnection.timestamp,
            ];
        return {
            query: this.addDeviceConnectionQueryText,
            params,
        };
    }

    private readonly addDeviceConnectionQueryText = `
        INSERT INTO device_connection_event
        (
            device_id,
            ip_address,
            type,
            note,
            timestamp
        )
        VALUES
        (
            $1, $2, $3, $4, $5
        )
        RETURNING 
            id,
            device_id,
            ip_address,
            type,
            note,
            timestamp
    `;
}
