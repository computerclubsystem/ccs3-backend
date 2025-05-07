import { createOperatorUpdateProfileSettingsReplyMessage, OperatorUpdateProfileSettingsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-profile-settings.messages.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { BusUpdateProfileSettingsReplyMessageBody, createBusUpdateProfileSettingsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-profile-settings.messages.mjs';

export class UpdateProfileSettingsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorUpdateProfileSettingsRequestMessage;
        const busReqMsg = createBusUpdateProfileSettingsRequestMessage();
        busReqMsg.body.profileSettings = message.body.profileSettings;
        busReqMsg.body.userId = context.clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateProfileSettingsReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateProfileSettingsReplyMessage();
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}