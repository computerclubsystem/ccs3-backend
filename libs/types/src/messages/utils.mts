import { Message } from './declarations/message.mjs';
import { OperatorMessage } from './operators/declarations/operator.message.mjs';

export function transferSharedMessageDataToReplyMessage(targetMessage: Message<any>, sourceMessage?: Message<any> | null): void {
    if (sourceMessage?.header) {
        targetMessage.header.correlationId = sourceMessage.header.correlationId;
        targetMessage.header.roundTripData = sourceMessage.header.roundTripData;
    }
};

export function transferSharedMessageDataToReplyOperatorMessage(targetMessage: Message<any>, sourceMessage?: OperatorMessage<any> | null): void {
    if (sourceMessage?.header) {
        targetMessage.header.correlationId = sourceMessage.header.correlationId;
        targetMessage.header.roundTripData = sourceMessage.header.roundTripData;
    }
};