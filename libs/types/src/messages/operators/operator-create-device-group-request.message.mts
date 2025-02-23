import { DeviceGroup } from 'src/entities/device-group.mjs';
import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorCreateDeviceGroupRequestMessageBody {
    deviceGroup: DeviceGroup;
    assignedTariffIds: number[];
}

export type OperatorCreateDeviceGroupRequestMessage = OperatorRequestMessage<OperatorCreateDeviceGroupRequestMessageBody>;
