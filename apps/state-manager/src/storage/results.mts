import { IDeviceSession } from './entities/device-session.mjs';
import { IDeviceStatus } from './entities/device-status.mjs';
import { ITariffRecharge } from './entities/tariff-recharge.mjs';
import { ITariff } from './entities/tariff.mjs';

export interface TransferDeviceResult {
    sourceDeviceStatus: IDeviceStatus;
    targetDeviceStatus: IDeviceStatus;
}

export interface CompleteDeviceStatusUpdateResult {
    deviceStatus: IDeviceStatus;
    deviceSession: IDeviceSession;
}

export interface IncreaseTariffRemainingSecondsResult {
    tariff: ITariff;
    tariffRecharge: ITariffRecharge;
}

export interface ICompletedSessionsSummary {
    total: number;
    count: number;
    completedSessions: IDeviceSession[];
}

export interface ICurrentSessionsSummary {
    total: number;
    count: number;
}

export interface ICurrentContinuationsSummary {
    total: number;
    count: number;
}

export interface ITariffRechargesSummary {
    total: number;
    count: number;
}
