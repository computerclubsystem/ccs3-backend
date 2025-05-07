import { BusCreateDeviceReplyMessageBody, createBusCreateDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-device.messages.mjs';
import { createOperatorCreateDeviceReplyMessage, OperatorCreateDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-device.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';

export class CreateDeviceRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorCreateDeviceRequestMessage;
        const busReqMsg = createBusCreateDeviceRequestMessage();
        busReqMsg.body.device = message.body.device;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateDeviceReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateDeviceReplyMessage();
                operatorReplyMsg.body.device = busReplyMsg.body.device;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}