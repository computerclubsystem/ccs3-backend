import { createOperatorCreateRoleWithPermissionsReplyMessage, OperatorCreateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-role-with-permissions.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusCreateRoleWithPermissionsReplyMessageBody, createBusCreateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-create-role-with-permissions.messages.mjs';

export class CreateRoleWithPermissionsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorCreateRoleWithPermissionsRequestMessage;
        const requestMsg = createBusCreateRoleWithPermissionsRequestMessage();
        requestMsg.body.role = message.body.role;
        requestMsg.body.permissionIds = message.body.rolePermissionIds;
        this.publishToOperatorsChannelAndWaitForReply<BusCreateRoleWithPermissionsReplyMessageBody>(context, requestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorCreateRoleWithPermissionsReplyMessage();
                operatorReplyMsg.body.role = busReplyMsg.body.role;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.cantCreateRoleWithPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}