import { createOperatorSetDeviceStatusNoteReplyMessage, OperatorSetDeviceStatusNoteRequestMessage } from '@computerclubsystem/types/messages/operators/operator-set-device-status-note.messages.mjs';
import { BusSetDeviceStatusNoteReplyMessageBody, createBusSetDeviceStatusNoteRequestMessage } from '@computerclubsystem/types/messages/bus/bus-set-device-status-note.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from "../message-handler-base.mjs";

export class SetDeviceStatusNoteRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorSetDeviceStatusNoteRequestMessage;
        const busReqMsg = createBusSetDeviceStatusNoteRequestMessage();
        busReqMsg.body.deviceIds = message.body.deviceIds;
        busReqMsg.body.note = message.body.note;
        this.publishToOperatorsChannelAndWaitForReply<BusSetDeviceStatusNoteReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorSetDeviceStatusNoteReplyMessage();
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}