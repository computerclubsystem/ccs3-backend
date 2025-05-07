import { createOperatorUpdateDeviceGroupReplyMessage, OperatorUpdateDeviceGroupRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-device-group.messages.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { BusUpdateDeviceGroupReplyMessageBody, createBusUpdateDeviceGroupRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-device-group.messages.mjs';

export class UpdateDeviceGroupRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorUpdateDeviceGroupRequestMessage;
        const busReqMsg = createBusUpdateDeviceGroupRequestMessage();
        busReqMsg.body.deviceGroup = message.body.deviceGroup;
        busReqMsg.body.assignedTariffIds = message.body.assignedTariffIds;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateDeviceGroupReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateDeviceGroupReplyMessage();
                operatorReplyMsg.body.deviceGroup = busReplyMsg.body.deviceGroup;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}