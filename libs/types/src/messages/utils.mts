import { Message } from './declarations/message.mjs';

export function transferSharedMessageData(targetMessage: Message<unknown>, sourceMessage?: Message<unknown> | null): void {
    if (sourceMessage?.header) {
        targetMessage.header.correlationId = sourceMessage.header.correlationId;
        targetMessage.header.roundTripData = sourceMessage.header.roundTripData;
    }
};