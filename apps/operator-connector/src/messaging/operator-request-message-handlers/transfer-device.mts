import { createOperatorTransferDeviceReplyMessage, OperatorTransferDeviceRequestMessage } from '@computerclubsystem/types/messages/operators/operator-transfer-device.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusTransferDeviceReplyMessageBody, createBusTransferDeviceRequestMessage } from '@computerclubsystem/types/messages/bus/bus-transfer-device.messages.mjs';

export class TransferDeviceRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorTransferDeviceRequestMessage;
        const busRequestMsg = createBusTransferDeviceRequestMessage();
        busRequestMsg.body.sourceDeviceId = message.body.sourceDeviceId;
        busRequestMsg.body.targetDeviceId = message.body.targetDeviceId;
        busRequestMsg.body.userId = context.clientData.userId!;
        busRequestMsg.body.transferNote = message.body.transferNote;
        this.publishToOperatorsChannelAndWaitForReply<BusTransferDeviceReplyMessageBody>(context, busRequestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorTransferDeviceReplyMessage();
                operatorReplyMsg.body.sourceDeviceStatus = busReplyMsg.body.sourceDeviceStatus;
                operatorReplyMsg.body.targetDeviceStatus = busReplyMsg.body.targetDeviceStatus;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}