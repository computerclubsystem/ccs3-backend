import { createOperatorGetAllDeviceGroupsReplyMessage, OperatorGetAllDeviceGroupsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-device-groups.messages.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { BusGetAllDeviceGroupsReplyMessageBody, createBusGetAllDeviceGroupsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-device-groups.messages.mjs';

export class GetAllDeviceGroupsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetAllDeviceGroupsRequestMessage;
        const busReqMsg = createBusGetAllDeviceGroupsRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllDeviceGroupsReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllDeviceGroupsReplyMessage();
                operatorReplyMsg.body.deviceGroups = busReplyMsg.body.deviceGroups;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}