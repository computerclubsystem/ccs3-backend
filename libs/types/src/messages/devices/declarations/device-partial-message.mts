import { DeviceMessageError } from './device-message-error.mjs';

export interface DevicePartialMessageHeader {
    type: string;
    correlationId?: string | null;
    faliure?: boolean | null;
    messageErrors?: DeviceMessageError[] | null;
}

export interface DevicePartialMessage<TBody> {
    header: DevicePartialMessageHeader;
    body: TBody;
}
