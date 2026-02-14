import { Device } from '@computerclubsystem/types/entities/device.mjs';
import { DeviceConnectionEventType } from '@computerclubsystem/types/entities/declarations/device-connection-event-type.mjs';
import { DeviceConnectionEventType as DeviceConnectionEventTypeStorage } from './storage/entities/constants/device-connection-event-type.mjs';
import { OperatorConnectionEventType as OperatorConnectionEventTypeStorage } from './storage/entities/constants/operator-connection-event-type.mjs';
import { IDevice } from './storage/entities/device.mjs';
import { OperatorConnectionEventType } from '@computerclubsystem/types/entities/declarations/operator-connection-event-type.mjs';
import { ITariff, TariffType as StorageTariffType } from './storage/entities/tariff.mjs';
import { Tariff, TariffType } from '@computerclubsystem/types/entities/tariff.mjs';
import { IDeviceStatus } from './storage/entities/device-status.mjs';
import { DeviceStatus } from '@computerclubsystem/types/messages/bus/bus-device-statuses-notification.message.mjs';
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
import { IShiftsSummary } from './storage/entities/shifts-summary.mjs';
import { ShiftsSummary } from '@computerclubsystem/types/entities/shifts-summary.mjs';
import { ISystemSetting } from './storage/entities/system-setting.mjs';
import { SystemSetting } from '@computerclubsystem/types/entities/system-setting.mjs';
import { IDeviceGroup } from './storage/entities/device-group.mjs';
import { DeviceGroup } from '@computerclubsystem/types/entities/device-group.mjs';
import { IDeviceSession } from './storage/entities/device-session.mjs';
import { DeviceSession } from '@computerclubsystem/types/entities/device-session.mjs';
import { ILongLivedAccessToken } from './storage/entities/long-lived-access-token.mjs';
import { LongLivedAccessToken } from '@computerclubsystem/types/entities/long-lived-access-token.mjs';
import { IDeviceWithTariff } from './storage/entities/device-with-tariff.mjs';
import { DeviceWithTariff } from '@computerclubsystem/types/entities/device-with-tariff.mjs';

export class EntityConverter {
    toLongLivedAccessToken(storageLongLivedAccessToken: ILongLivedAccessToken): LongLivedAccessToken {
        const longLivedAccessToken: LongLivedAccessToken = {
            id: storageLongLivedAccessToken.id,
            issuedAt: storageLongLivedAccessToken.issued_at,
            token: storageLongLivedAccessToken.token,
            validTo: storageLongLivedAccessToken.valid_to,
            tariffId: storageLongLivedAccessToken.tariff_id,
            userId: storageLongLivedAccessToken.user_id,
        };
        return longLivedAccessToken;
    }

    toDeviceSession(storageDeviceSession: IDeviceSession): DeviceSession {
        const deviceSession: DeviceSession = {
            deviceId: storageDeviceSession.device_id,
            id: storageDeviceSession.id,
            startedAt: storageDeviceSession.started_at,
            stoppedAt: storageDeviceSession.stopped_at,
            tariffId: storageDeviceSession.tariff_id,
            totalAmount: storageDeviceSession.total_amount,
            note: storageDeviceSession.note,
            startedByCustomer: storageDeviceSession.started_by_customer,
            startedByUserId: storageDeviceSession.started_by_user_id,
            stoppedByCustomer: storageDeviceSession.stopped_by_customer,
            stoppedByUserId: storageDeviceSession.stopped_by_user_id,
        };
        return deviceSession;
    }

    toStorageDeviceGroup(deviceGroup: DeviceGroup): IDeviceGroup {
        const storageDeviceGroup: IDeviceGroup = {
            id: deviceGroup.id,
            name: deviceGroup.name,
            description: deviceGroup.description,
            enabled: deviceGroup.enabled,
            restrict_device_transfers: deviceGroup.restrictDeviceTransfers,
        };
        return storageDeviceGroup;
    }
    toDeviceGroup(storageDeviceGroup: IDeviceGroup): DeviceGroup {
        const deviceGroup: DeviceGroup = {
            id: storageDeviceGroup.id,
            name: storageDeviceGroup.name,
            description: storageDeviceGroup.description,
            enabled: storageDeviceGroup.enabled,
            restrictDeviceTransfers: storageDeviceGroup.restrict_device_transfers,
        };
        return deviceGroup;
    }

    toSystemSetting(storageSystemSetting: ISystemSetting): SystemSetting {
        const systemSetting: SystemSetting = {
            name: storageSystemSetting.name,
            type: storageSystemSetting.type,
            allowedValues: storageSystemSetting.allowedValues,
            description: storageSystemSetting.description,
            value: storageSystemSetting.value,
        };
        return systemSetting;
    }

    toShiftsSummary(storageShiftsSummary: IShiftsSummary): ShiftsSummary {
        const shiftsSummary: ShiftsSummary = {
            completedSessionsCount: storageShiftsSummary.completed_sessions_count,
            completedSessionsTotal: storageShiftsSummary.completed_sessions_total,
            continuationsCount: storageShiftsSummary.continuations_count,
            continuationsTotal: storageShiftsSummary.completed_sessions_total,
            createdPrepaidTariffsCount: storageShiftsSummary.created_prepaid_tariffs_count,
            createdPrepaidTariffsTotal: storageShiftsSummary.created_prepaid_tariffs_total,
            rechargedPrepaidTariffsCount: storageShiftsSummary.recharged_prepaid_tariffs_count,
            rechargedPrepaidTariffsTotal: storageShiftsSummary.recharged_prepaid_tariffs_total,
            runningSessionsCount: storageShiftsSummary.running_sessions_count,
            runningSessionsTotal: storageShiftsSummary.running_sessions_total,
            totalAmount: storageShiftsSummary.total_amount,
        };
        return shiftsSummary;
    }

    toShift(storageShift: IShift): Shift {
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
    toDeviceContinuation(storageDeviceContinuation: IDeviceContinuation): DeviceContinuation {
        const result: DeviceContinuation = {
            deviceId: storageDeviceContinuation.device_id,
            tariffId: storageDeviceContinuation.tariff_id,
            userId: storageDeviceContinuation.user_id,
        } as DeviceContinuation;
        return result;
    }

    /**
     * Converts DeviceContinuation to IDeviceContinuation without requestedAt
     * @param deviceContinuation 
     * @returns IDeviceContinuation without requestedAt set
     */
    toStorageDeviceContinuation(deviceContinuation: DeviceContinuation): IDeviceContinuation {
        const result: IDeviceContinuation = {
            device_id: deviceContinuation.deviceId,
            tariff_id: deviceContinuation.tariffId,
            user_id: deviceContinuation.userId,
        } as IDeviceContinuation;
        return result;
    }

    toStorageUser(user: User): IUser {
        const storageUser: IUser = {
            created_at: user.createdAt,
            enabled: user.enabled,
            id: user.id,
            username: user.username,
            updated_at: user.updatedAt,
        };
        return storageUser;
    }

    toUser(storageUser: IUser): User {
        const user: User = {
            createdAt: storageUser.created_at,
            enabled: storageUser.enabled,
            id: storageUser.id,
            username: storageUser.username,
            updatedAt: storageUser.updated_at,
        };
        return user;
    }

    toPermission(storagePermission: IPermission): Permission {
        const permission: Permission = {
            id: storagePermission.id,
            name: storagePermission.name,
            description: storagePermission.description,
        };
        return permission;
    }

    toRole(storageRole: IRole): Role {
        const role: Role = {
            enabled: storageRole.enabled,
            id: storageRole.id,
            name: storageRole.name,
            description: storageRole.description,
        };
        return role;
    }

    toStorageRole(role: Role): IRole {
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

    toDeviceStatus(storageDeviceStatus: IDeviceStatus): DeviceStatus {
        const deviceStatus: DeviceStatus = {
            deviceId: storageDeviceStatus.device_id,
            enabled: storageDeviceStatus.enabled,
            started: storageDeviceStatus.started,
            totalSum: storageDeviceStatus.total,
            tariff: storageDeviceStatus.start_reason,
            startedByUserId: storageDeviceStatus.started_by_user_id,
            note: storageDeviceStatus.note,
        } as DeviceStatus;
        return deviceStatus;
    }

    toTariff(storageTariff: ITariff): Tariff {
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
            createdByUserId: storageTariff.created_by_user_id,
            updatedByUserId: storageTariff.updated_by_user_id,
        };
        return tariff;
    }

    toStorageTariff(tariff: Tariff): ITariff {
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
            created_by_user_id: tariff.createdByUserId,
            updated_by_user_id: tariff.updatedByUserId,
        };
        return storageTariff;
    }

    toStorageDevice(device: Device): IDevice {
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
            disable_transfer: device.disableTransfer,
        };
        return storageDevice;
    }

    toDevice(storageDevice: IDevice): Device {
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
            disableTransfer: storageDevice.disable_transfer,
        };
        return device;
    }

    toDeviceWithTariff(storageDeviceWithTariff: IDeviceWithTariff): DeviceWithTariff {
        return {
            deviceId: storageDeviceWithTariff.device_id,
            tariffId: storageDeviceWithTariff.tariff_id,
        };
    }
}
