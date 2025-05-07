import { createOperatorUpdateRoleWithPermissionsReplyMessage, OperatorUpdateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-update-role-with-permissions.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusUpdateRoleWithPermissionsReplyMessageBody, createBusUpdateRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-update-role-with-permissions.messages.mjs';

export class UpdateRoleWithPermissionsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorUpdateRoleWithPermissionsRequestMessage;
        const requestMsg = createBusUpdateRoleWithPermissionsRequestMessage();
        requestMsg.body.role = message.body.role;
        requestMsg.body.permissionIds = message.body.rolePermissionIds;
        this.publishToOperatorsChannelAndWaitForReply<BusUpdateRoleWithPermissionsReplyMessageBody>(context, requestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorUpdateRoleWithPermissionsReplyMessage();
                operatorReplyMsg.body.role = busReplyMsg.body.role;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.cantUpdateRoleWithPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}