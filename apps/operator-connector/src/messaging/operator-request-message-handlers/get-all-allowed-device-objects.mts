import { createOperatorGetAllAllowedDeviceObjectsReplyMessage, OperatorGetAllAllowedDeviceObjectsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-all-allowed-device-objects.messages.mjs';
import { BusGetAllAllowedDeviceObjectsReplyMessageBody, createBusGetAllAllowedDeviceObjectsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-all-allowed-device-objects.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from "../message-handler-base.mjs";

export class GetAllAllowedDeviceObjectsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetAllAllowedDeviceObjectsRequestMessage;
        const busReqMsg = createBusGetAllAllowedDeviceObjectsRequestMessage();
        this.publishToOperatorsChannelAndWaitForReply<BusGetAllAllowedDeviceObjectsReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetAllAllowedDeviceObjectsReplyMessage();
                operatorReplyMsg.body.allowedDeviceObjects = busReplyMsg.body.allowedDeviceObjects;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}