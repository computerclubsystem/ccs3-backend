import { createOperatorGetAllSystemSettingsReplyMessage, OperatorGetAllSystemSettingsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-system-settings.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetAllSystemSettingsReplyMessageBody, createBusGetAllSystemSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-system-settings.messages.mjs';

export class GetAllSystemSettingsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetAllSystemSettingsRequestMessage;
        const busReqMsg = createBusGetAllSystemSettingsRequestMessage();
        this.publishToSharedChannelAndWaitForReply<BusGetAllSystemSettingsReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllSystemSettingsReplyMessage();
                operatorReplyMsg.body.systemSettings = busReplyMsg.body.systemSettings;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}