import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { DeviceToServerRequestMessage } from '@computerclubsystem/types/messages/devices/declarations/device-to-server-request-message.mjs';
import { ServerToDeviceReplyMessage } from '@computerclubsystem/types/messages/devices/declarations/server-to-device-reply-message.mjs';

export class ErrorHelper {
    setBusMessageFailure(busMessage: Message<unknown>, requestMessage: DeviceToServerRequestMessage<unknown> | Message<unknown>, replyMessage: ServerToDeviceReplyMessage<unknown> | Message<unknown>): void {
        if (busMessage.header.failure) {
            const firstErrorCode = busMessage.header.errors?.[0]?.code || '';
            replyMessage.header.failure = true;
            replyMessage.header.errors = [{ code: firstErrorCode, description: `Can't process message '${requestMessage?.header?.type}'` }];
        }
    }
}