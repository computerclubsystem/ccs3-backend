import { createOperatorCreateDeviceGroupReplyMessage, OperatorCreateDeviceGroupRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-device-group.messages.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { BusCreateDeviceGroupReplyMessageBody, createBusCreateDeviceGroupRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-device-group.messages.mjs';

export class CreateDeviceGroupRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorCreateDeviceGroupRequestMessage;
        const busReqMsg = createBusCreateDeviceGroupRequestMessage();
        busReqMsg.body.deviceGroup = message.body.deviceGroup;
        busReqMsg.body.assignedTariffIds = message.body.assignedTariffIds;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateDeviceGroupReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateDeviceGroupReplyMessage();
                operatorReplyMsg.body.deviceGroup = busReplyMsg.body.deviceGroup;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}