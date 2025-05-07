import { createOperatorStopDeviceReplyMessage, OperatorStopDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-stop-device.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusStopDeviceReplyMessageBody, createBusStopDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-stop-device.messages.mjs';

export class StopDeviceRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorStopDeviceRequestMessage;
        const requestMsg = createBusStopDeviceRequestMessage();
        requestMsg.body.deviceId = message.body.deviceId;
        requestMsg.body.userId = context.clientData.userId!;
        requestMsg.body.note = message.body.note;
        // TODO: stoppedByCustomer is used by pc-connector to specify if the computer was requested to be stopped by customer
        // requestMsg.body.stoppedByCustomer
        this.publishToOperatorsChannelAndWaitForReply<BusStopDeviceReplyMessageBody>(context, requestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorStopDeviceReplyMessage();
                operatorReplyMsg.body.deviceStatus = busReplyMsg.body.deviceStatus;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}