import { createOperatorGetDeviceGroupDataReplyMessage, OperatorGetDeviceGroupDataRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-group-data.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetDeviceGroupDataReplyMessageBody, createBusGetDeviceGroupDataRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-group-data.messages.mjs';

export class GetDeviceGroupDataRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetDeviceGroupDataRequestMessage;
        const busReqMsg = createBusGetDeviceGroupDataRequestMessage();
        busReqMsg.body.deviceGroupId = message.body.deviceGroupId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetDeviceGroupDataReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetDeviceGroupDataReplyMessage();
                operatorReplyMsg.body.deviceGroupData = busReplyMsg.body.deviceGroupData;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}
