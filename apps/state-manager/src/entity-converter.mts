import { Device } from '@computerclubsystem/types/entities/device.mjs';
import { DeviceConnectionEventType } from '@computerclubsystem/types/entities/declarations/device-connection-event-type.mjs';
import { DeviceConnectionEventType as DeviceConnectionEventTypeStorage } from './storage/entities/constants/device-connection-event-type.mjs';
import { OperatorConnectionEventType as OperatorConnectionEventTypeStorage } from './storage/entities/constants/operator-connection-event-type.mjs';
import { IDevice } from './storage/entities/device.mjs';
import { OperatorConnectionEventType } from '@computerclubsystem/types/entities/declarations/operator-connection-event-type.mjs';
import { ITariff, TariffType as StorageTariffType } from './storage/entities/tariff.mjs';
import { Tariff, TariffType } from '@computerclubsystem/types/entities/tariff.mjs';
import { IDeviceStatus } from './storage/entities/device-status.mjs';
import { DeviceStatus } from '@computerclubsystem/types/messages/bus/bus-device-statuses.message.mjs';
import { IRole } from './storage/entities/role.mjs';
import { Role } from '@computerclubsystem/types/entities/role.mjs';
import { IPermission } from './storage/entities/permission.mjs';
import { Permission } from '@computerclubsystem/types/entities/permission.mjs';
import { IUser } from './storage/entities/user.mjs';
import { User } from '@computerclubsystem/types/entities/user.mjs';
import { IDeviceContinuation } from './storage/entities/device-continuation.mjs';
import { DeviceContinuation } from '@computerclubsystem/types/entities/device-continuation.mjs';
import { IShift } from './storage/entities/shift.mjs';
import { Shift } from '@computerclubsystem/types/entities/shift.mjs';

export class EntityConverter {
    storageShiftToShift(storageShift: IShift): Shift {
        const shift: Shift = {
            id: storageShift.id,
            completedSessionsCount: storageShift.completed_sessions_count,
            completedSessionsTotal: storageShift.completed_sessions_total,
            runningSessionsCount: storageShift.running_sessions_count,
            runningSessionsTotal: storageShift.running_sessions_total,
            continuationsCount: storageShift.continuations_count,
            continuationsTotal: storageShift.continuations_total,
            createdPrepaidTariffsCount: storageShift.created_prepaid_tariffs_count,
            createdPrepaidTariffsTotal: storageShift.created_prepaid_tariffs_total,
            rechargedPrepaidTariffsCount: storageShift.recharged_prepaid_tariffs_count,
            rechargedPrepaidTariffsTotal: storageShift.recharged_prepaid_tariffs_total,
            totalAmount: storageShift.total_amount,
            completedAt: storageShift.completed_at,
            userId: storageShift.user_id,
            note: storageShift.note,
        };
        return shift;
    }

    /**
     * Converts DeviceContinuation to IDeviceContinuation without requestedAt
     * @param deviceContinuation 
     * @returns IDeviceContinuation without requestedAt set
     */
    storageDeviceContinuationToDeviceContinuation(storageDeviceContinuation: IDeviceContinuation): DeviceContinuation {
        const result: DeviceContinuation = {
            deviceId: storageDeviceContinuation.deviceId,
            tariffId: storageDeviceContinuation.tariffId,
            userId: storageDeviceContinuation.userId,
        } as DeviceContinuation;
        return result;
    }

    /**
     * Converts DeviceContinuation to IDeviceContinuation without requestedAt
     * @param deviceContinuation 
     * @returns IDeviceContinuation without requestedAt set
     */
    deviceContinuationToStorageDeviceContinuation(deviceContinuation: DeviceContinuation): IDeviceContinuation {
        const result: IDeviceContinuation = {
            deviceId: deviceContinuation.deviceId,
            tariffId: deviceContinuation.tariffId,
            userId: deviceContinuation.userId,
        } as IDeviceContinuation;
        return result;
    }

    userToStorageUser(user: User): IUser {
        const storageUser: IUser = {
            created_at: user.createdAt,
            enabled: user.enabled,
            id: user.id,
            username: user.username,
            updated_at: user.updatedAt,
        };
        return storageUser;
    }

    storageUserToUser(storageUser: IUser): User {
        const user: User = {
            createdAt: storageUser.created_at,
            enabled: storageUser.enabled,
            id: storageUser.id,
            username: storageUser.username,
            updatedAt: storageUser.updated_at,
        };
        return user;
    }

    storagePermissionToPermission(storagePermission: IPermission): Permission {
        const permission: Permission = {
            id: storagePermission.id,
            name: storagePermission.name,
            description: storagePermission.description,
        };
        return permission;
    }

    storageRoleToRole(storageRole: IRole): Role {
        const role: Role = {
            enabled: storageRole.enabled,
            id: storageRole.id,
            name: storageRole.name,
            description: storageRole.description,
        };
        return role;
    }

    roleToStorageRole(role: Role): IRole {
        const storageRole: IRole = {
            enabled: role.enabled,
            id: role.id,
            name: role.name,
            description: role.description,
        };
        return storageRole;
    }

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
            canBeStartedByCustomer: storageTariff.can_be_started_by_customer,
            remainingSeconds: storageTariff.remaining_seconds,
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
            can_be_started_by_customer: tariff.canBeStartedByCustomer,
            remaining_seconds: tariff.remainingSeconds,
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
