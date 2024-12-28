import { Device } from '@computerclubsystem/types/entities/device.mjs';
import { DeviceConnectionEventType } from '@computerclubsystem/types/entities/device-connection-event-type.mjs';
import { DeviceConnectionEventType as DeviceConnectionEventTypeStorage } from './storage/entities/constants/device-connection-event-type.mjs';
import { OperatorConnectionEventType as OperatorConnectionEventTypeStorage } from './storage/entities/constants/operator-connection-event-type.mjs';
import { IDevice } from './storage/entities/device.mjs';
import { OperatorConnectionEventType } from '@computerclubsystem/types/entities/operator-connection-event-type.mjs';

export class EntityConverter {
    deviceConnectionEventTypeToDeviceConnectionEventStorage(deviceConnectionEventType: DeviceConnectionEventType): DeviceConnectionEventTypeStorage {
        return (deviceConnectionEventType as number) as DeviceConnectionEventTypeStorage;
    }

    operatorConnectionEventTypeToOperatorConnectionEventStorage(operatorConnectionEventType: OperatorConnectionEventType): OperatorConnectionEventTypeStorage {
        return (operatorConnectionEventType as number) as OperatorConnectionEventTypeStorage;
    }

    storageDeviceToDevice(storageDevice: IDevice): Device {
        const device: Device = {
            approved: storageDevice.approved,
            certificateThumbprint: storageDevice.certificate_thumbprint,
            createdAt: storageDevice.created_at,
            enabled: storageDevice.enabled,
            id: storageDevice.id,
            ipAddress: storageDevice.ip_address,
            description: storageDevice.description,
            deviceGroupId: storageDevice.device_group_id,
            name: storageDevice.name,
        };
        return device;
    }
}
