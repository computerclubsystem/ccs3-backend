import { ServerToDeviceReplyMessageHeader } from './declarations/server-to-device-reply-message-header.mjs';
import { ServerToDeviceReplyMessageType } from './declarations/server-to-device-reply-message-type.mjs';
import { ServerToDeviceReplyMessage } from './declarations/server-to-device-reply-message.mjs';

export interface ServerToDeviceStartOnPrepaidTariffReplyMessageBody {
    alreadyInUse?: boolean | null;
    notAllowed?: boolean | null;
    passwordDoesNotMatch?: boolean | null;
    noRemainingTime?: boolean | null;
    notAvailableForThisDeviceGroup?: boolean | null;
    remainingSeconds?: number | null;
    success?: boolean | null;
}

export interface ServerToDeviceStartOnPrepaidTariffReplyMessage extends ServerToDeviceReplyMessage<ServerToDeviceStartOnPrepaidTariffReplyMessageBody> {
}

export function createServerToDeviceStartOnPrepaidTariffReplyMessage(): ServerToDeviceStartOnPrepaidTariffReplyMessage {
    const msg: ServerToDeviceStartOnPrepaidTariffReplyMessage = {
        header: {
            type: ServerToDeviceReplyMessageType.startOnPrepaidTariff,
        } as ServerToDeviceReplyMessageHeader,
        body: {},
    };
    return msg;
}