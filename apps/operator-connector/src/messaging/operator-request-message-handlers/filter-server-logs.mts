import { createOperatorFilterServerLogsReplyMessage, OperatorFilterServerLogsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-filter-server-logs.messages.mjs';
import { createBusFilterServerLogsNotificationMessage } from '@computerclubsystem/types/messages/bus/bus-filter-server-logs-notification.message.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';

export class FilterServerLogsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorFilterServerLogsRequestMessage;
        const busReqMsg = createBusFilterServerLogsNotificationMessage();
        busReqMsg.body.filterServerLogsItems = message.body.filterServerLogsItems;
        this.publishToSharedChannel(context, busReqMsg);
        const operatorConnectorFilterLogsItem = message.body.filterServerLogsItems.find(x => x.serviceName === context.messageBusIdentifier);
        if (operatorConnectorFilterLogsItem) {
            context.operatorConnectorState.filterLogsItem = operatorConnectorFilterLogsItem;
            context.operatorConnectorState.filterLogsRequestedAt = this.getNowAsNumber();
            context.logger.setMessageFilter(operatorConnectorFilterLogsItem.messageFilter);
        }
        const operatorReplyMsg = createOperatorFilterServerLogsReplyMessage();
        this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
    }
}
