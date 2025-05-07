import { createOperatorGetRoleWithPermissionsReplyMessage, OperatorGetRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/operators/operator-get-role-with-permissions.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { BusGetRoleWithPermissionsReplyMessageBody, createBusGetRoleWithPermissionsRequestMessage } from '@computerclubsystem/types/messages/bus/bus-get-role-with-permissions.messages.mjs';

export class GetRoleWithPermissionsRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorGetRoleWithPermissionsRequestMessage;
        const requestMsg = createBusGetRoleWithPermissionsRequestMessage();
        requestMsg.body.roleId = message.body.roleId;
        this.publishToOperatorsChannelAndWaitForReply<BusGetRoleWithPermissionsReplyMessageBody>(context, requestMsg)
            .subscribe(busReplyMsg => {
                const operatorReplyMsg = createOperatorGetRoleWithPermissionsReplyMessage();
                operatorReplyMsg.body.allPermissions = busReplyMsg.body.allPermissions;
                operatorReplyMsg.body.role = busReplyMsg.body.role;
                operatorReplyMsg.body.rolePermissionIds = busReplyMsg.body.rolePermissionIds;
                if (busReplyMsg.header.failure) {
                    operatorReplyMsg.header.failure = true;
                    operatorReplyMsg.header.errors = context.errorReplyHelper.cantGetAllRoleWithPermissionsErrors(busReplyMsg.header.errors);
                }
                this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            });
    }
}