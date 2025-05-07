import { createOperatorGetDeviceConnectivityDetailsReplyMessage, OperatorGetDeviceConnectivityDetailsReplyMessageBody, OperatorGetDeviceConnectivityDetailsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-connectivity-details.messages.mjs';
import { BusGetDeviceConnectivityDetailsReplyMessageBody, createBusGetDeviceConnectivityDetailsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-connectivity-details.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';

export class GetDeviceConnectivityDetailsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetDeviceConnectivityDetailsRequestMessage;
        const busReqMsg = createBusGetDeviceConnectivityDetailsRequestMessage();
        busReqMsg.body.deviceId = message.body.deviceId;
        this.publishToDevicesChannelAndWaitForReply<BusGetDeviceConnectivityDetailsReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetDeviceConnectivityDetailsReplyMessage();
                const busBody = busReplyMsg.body;
                const replyMsgBody: OperatorGetDeviceConnectivityDetailsReplyMessageBody = {
                    connectionEventItems: busBody.connectionEventItems,
                    connectionsCount: busBody.connectionsCount,
                    deviceId: busBody.deviceId,
                    isConnected: busBody.isConnected,
                    receivedMessagesCount: busBody.receivedMessagesCount,
                    secondsSinceLastConnection: busBody.secondsSinceLastConnection,
                    sentMessagesCount: busBody.sentMessagesCount,
                    secondsSinceLastReceivedMessage: busBody.secondsSinceLastReceivedMessage,
                    secondsSinceLastSentMessage: busBody.secondsSinceLastSentMessage,
                };
                operatorReplyMsg.body = replyMsgBody;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}