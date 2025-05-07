import { createOperatorGetDeviceCompletedSessionsReplyMessage, OperatorGetDeviceCompletedSessionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-device-completed-sessions.messages.mjs';
import { BusGetDeviceCompletedSessionsReplyMessageBody, createBusGetDeviceCompletedSessionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-device-completed-sessions.messages.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';

export class GetDeviceCompletedSessionsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetDeviceCompletedSessionsRequestMessage;
        const busReqMsg = createBusGetDeviceCompletedSessionsRequestMessage();
        busReqMsg.body.deviceId = message.body.deviceId;
        busReqMsg.body.fromDate = message.body.fromDate;
        busReqMsg.body.toDate = message.body.toDate;
        busReqMsg.body.userId = message.body.userId;
        busReqMsg.body.tariffId = message.body.tariffId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetDeviceCompletedSessionsReplyMessageBody>(context, busReqMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetDeviceCompletedSessionsReplyMessage();
                operatorReplyMsg.body.deviceSessions = busReplyMsg.body.deviceSessions;
                operatorReplyMsg.body.totalSum = busReplyMsg.body.totalSum;
                context.errorReplyHelper.setBusMessageFailure(busReplyMsg, message, operatorReplyMsg);
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}