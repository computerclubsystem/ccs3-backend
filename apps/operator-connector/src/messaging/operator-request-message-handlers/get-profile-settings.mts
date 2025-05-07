import { createOperatorGetProfileSettingsReplyMessage, OperatorGetProfileSettingsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-profile-settings.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetProfileSettingsReplyMessageBody, createBusGetProfileSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-profile-settings.messages.mjs';

export class GetProfileSettingsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetProfileSettingsRequestMessage;
        const busReqMsg = createBusGetProfileSettingsRequestMessage();
        busReqMsg.body.userId = context.clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusGetProfileSettingsReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetProfileSettingsReplyMessage();
                operatorReplyMsg.body.settings = busReplyMsg.body.settings;
                operatorReplyMsg.body.username = busReplyMsg.body.username;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}