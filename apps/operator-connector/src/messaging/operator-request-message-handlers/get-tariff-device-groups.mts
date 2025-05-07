import { createOperatorGetTariffDeviceGroupsReplyMessage, OperatorGetTariffDeviceGroupsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-tariff-device-groups.messages.mjs';
import { BusGetTariffDeviceGroupsReplyMessageBody, createBusGetTariffDeviceGroupsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-tariff-device-groups.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';

export class GetTariffDeviceGroupsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetTariffDeviceGroupsRequestMessage;
        const busReqMsg = createBusGetTariffDeviceGroupsRequestMessage();
        busReqMsg.body.tariffId = message.body.tariffId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetTariffDeviceGroupsReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetTariffDeviceGroupsReplyMessage();
                operatorReplyMsg.body.deviceGroupIds = busReplyMsg.body.deviceGroupIds;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}