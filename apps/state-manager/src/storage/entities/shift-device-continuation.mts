import { IDeviceContinuation } from './device-continuation.mjs';

export interface IShiftDeviceContinuation extends IDeviceContinuation {
    id: number;
    shift_id: number;
}
