import { DeviceGroup } from 'src/entities/device-group.mjs';
import { OperatorRequestMessage } from './declarations/operator.message.mjs';

export interface OperatorUpdateDeviceGroupRequestMessageBody {
    deviceGroup: DeviceGroup;
    assignedTariffIds?: number[] | null;
}

export type OperatorUpdateDeviceGroupRequestMessage = OperatorRequestMessage<OperatorUpdateDeviceGroupRequestMessageBody>;
