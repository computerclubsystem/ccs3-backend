import { createOperatorUpdateSystemSettingsValuesReplyMessage, OperatorUpdateSystemSettingsValuesRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-system-settings-values.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusUpdateSystemSettingsValuesReplyMessageBody, createBusUpdateSystemSettingsValuesRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-system-settings-values.messages.mjs';
import { BusErrorCode } from '@computerclubsystem/types/messages/bus/declarations/bus-error-code.mjs';

export class UpdateSystemSettingsValuesRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorUpdateSystemSettingsValuesRequestMessage;
        const busReqMsg = createBusUpdateSystemSettingsValuesRequestMessage();
        busReqMsg.body.systemSettingsNameWithValues = message.body.systemSettingsNameWithValues;
        this.publishToSharedChannelAndWaitForReply<BusUpdateSystemSettingsValuesReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateSystemSettingsValuesReplyMessage();
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                // If the error is not BusErrorCode.serverError - get errors from bus reply - they are considered safe
                if (busReplyMsg.header.errors?.[0]?.code !== BusErrorCode.serverError) {
                    operatorReplyMsg.header.errors = busReplyMsg.header.errors;
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}