import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { DeviceToServerRequestMessage } from '@computerclubsystem/types/messages/devices/declarations/device-to-server-request-message.mjs';
import { ServerToDeviceReplyMessage } from '@computerclubsystem/types/messages/devices/declarations/server-to-device-reply-message.mjs';

export class ErrorHelper {
    setBusMessageFailure(busMessage: Message<any>, requestMessage: DeviceToServerRequestMessage<any> | Message<any>, replyMessage: ServerToDeviceReplyMessage<any> | Message<any>): void {
        if (busMessage.header.failure) {
            const firstErrorCode = busMessage.header.errors?.[0]?.code || '';
            replyMessage.header.failure = true;
            replyMessage.header.errors = [{ code: firstErrorCode, description: `Can't process message '${requestMessage?.header?.type}'` }];
        }
    }
}