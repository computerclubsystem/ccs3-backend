import { Message } from './declarations/message.mjs';
import { OperatorRequestMessage } from './operators/declarations/operator.message.mjs';

export function transferSharedMessageData(targetMessage: Message<any>, sourceMessage?: Message<any> | null): void {
    if (sourceMessage?.header) {
        targetMessage.header.correlationId = sourceMessage.header.correlationId;
        targetMessage.header.roundTripData = sourceMessage.header.roundTripData;
    }
};