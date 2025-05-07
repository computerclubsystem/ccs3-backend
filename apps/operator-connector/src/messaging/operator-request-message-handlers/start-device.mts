import { createOperatorStartDeviceReplyMessage, OperatorStartDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-start-device.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusStartDeviceReplyMessageBody, createBusStartDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-start-device.messages.mjs';

export class StartDeviceRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorStartDeviceRequestMessage;
        const busRequestMsg = createBusStartDeviceRequestMessage();
        busRequestMsg.body.deviceId = message.body.deviceId;
        busRequestMsg.body.tariffId = message.body.tariffId;
        busRequestMsg.body.userId = context.clientData.userId!;
        this.publishToOperatorsChannelAndWaitForReply<BusStartDeviceReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorStartDeviceReplyMessage();
                operatorReplyMsg.body.deviceStatus = busReplyMsg.body.deviceStatus;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.getCantStartTheDeviceErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}