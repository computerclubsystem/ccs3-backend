import { Device } from '@computerclubsystem/types/entities/device.mjs';
import { DeviceConnectionEventType } from '@computerclubsystem/types/entities/device-connection-event-type.mjs';
import { DeviceConnectionEventType as DeviceConnectionEventTypeStorage } from './storage/entities/constants/device-connection-event-type.mjs';
import { OperatorConnectionEventType as OperatorConnectionEventTypeStorage } from './storage/entities/constants/operator-connection-event-type.mjs';
import { IDevice } from './storage/entities/device.mjs';
import { OperatorConnectionEventType } from '@computerclubsystem/types/entities/operator-connection-event-type.mjs';
import { ITariff, TariffType as StorageTariffType } from './storage/entities/tariff.mjs';
import { Tariff, TariffType } from '@computerclubsystem/types/entities/tariff.mjs';
import { IDeviceStatus } from './storage/entities/device-status.mjs';
import { DeviceStatus } from '@computerclubsystem/types/messages/bus/bus-device-statuses.message.mjs';

export class EntityConverter {
    deviceConnectionEventTypeToDeviceConnectionEventStorage(deviceConnectionEventType: DeviceConnectionEventType): DeviceConnectionEventTypeStorage {
        return (deviceConnectionEventType as number) as DeviceConnectionEventTypeStorage;
    }

    operatorConnectionEventTypeToOperatorConnectionEventStorage(operatorConnectionEventType: OperatorConnectionEventType): OperatorConnectionEventTypeStorage {
        return (operatorConnectionEventType as number) as OperatorConnectionEventTypeStorage;
    }

    storageDeviceStatusToDeviceStatus(storageDeviceStatus: IDeviceStatus): DeviceStatus {
        const deviceStatus: DeviceStatus = {
            deviceId: storageDeviceStatus.device_id,
            enabled: storageDeviceStatus.enabled,
            started: storageDeviceStatus.started,
            totalSum: storageDeviceStatus.total,
            tariff: storageDeviceStatus.start_reason,
            startedByUserId: storageDeviceStatus.started_by_user_id,
        } as DeviceStatus;
        return deviceStatus;
    }

    storageTariffToTariff(storageTariff: ITariff): Tariff {
        const tariff: Tariff = {
            createdAt: storageTariff.created_at,
            enabled: storageTariff.enabled,
            id: storageTariff.id,
            name: storageTariff.name,
            price: storageTariff.price,
            type: storageTariff.type as unknown as TariffType,
            description: storageTariff.description,
            duration: storageTariff.duration,
            fromTime: storageTariff.from_time,
            toTime: storageTariff.to_time,
            updatedAt: storageTariff.updated_at,
            restrictStartFromTime: storageTariff.restrict_start_from_time,
            restrictStartTime: storageTariff.restrict_start_time,
            restrictStartToTime: storageTariff.restrict_start_to_time,
        };
        return tariff;
    }

    tariffToStorageTariff(tariff: Tariff): ITariff {
        const storageTariff: ITariff = {
            created_at: tariff.createdAt,
            enabled: tariff.enabled,
            id: tariff.id,
            name: tariff.name,
            price: tariff.price,
            type: tariff.type as unknown as StorageTariffType,
            description: tariff.description,
            duration: tariff.duration,
            from_time: tariff.fromTime,
            to_time: tariff.toTime,
            updated_at: tariff.updatedAt,
            restrict_start_from_time: tariff.restrictStartFromTime,
            restrict_start_time: tariff.restrictStartTime,
            restrict_start_to_time: tariff.restrictStartToTime,
        };
        return storageTariff;
    }

    deviceToStorageDevice(device: Device): IDevice {
        const storageDevice: IDevice = {
            approved: device.approved,
            certificate_thumbprint: device.certificateThumbprint,
            created_at: device.createdAt,
            enabled: device.enabled,
            id: device.id,
            ip_address: device.ipAddress,
            description: device.description,
            device_group_id: device.deviceGroupId,
            name: device.name,
        };
        return storageDevice;
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
