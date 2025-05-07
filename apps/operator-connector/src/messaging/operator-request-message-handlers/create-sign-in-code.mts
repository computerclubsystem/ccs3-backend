import { URL } from 'node:url';

import { createOperatorCreateSignInCodeReplyMessage, OperatorCreateSignInCodeRequestMessage } from '@computerclubsystem/types/messages/operators/operator-create-sign-in-code.messages.mjs';
import { OperatorRequestMessageHandler, OperatorRequestMessageHandlerResult, ProcessOperatorRequestMessageContext } from '../declarations.mjs';
import { MessageHandlerBase } from '../message-handler-base.mjs';
import { OperatorReplyMessageErrorCode } from '@computerclubsystem/types/messages/operators/declarations/error-code.mjs';
import { MessageError } from '@computerclubsystem/types/messages/declarations/message-error.mjs';
import { SystemSettingsName } from '@computerclubsystem/types/entities/system-setting-name.mjs';
import { CodeSignIn } from 'src/declarations.mjs';
import { BusCodeSignInIdentifierType } from '@computerclubsystem/types/messages/bus/declarations/bus-code-sign-in-identifier-type.mjs';

export class CreateSignInCodeRequestMessageHandler extends MessageHandlerBase implements OperatorRequestMessageHandler {
    async handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void> {
        const message = context.message as OperatorCreateSignInCodeRequestMessage;
        const operatorReplyMsg = createOperatorCreateSignInCodeReplyMessage();
        if (!context.operatorConnectorState.isQrCodeSignInFeatureEnabled) {
            operatorReplyMsg.header.failure = true;
            operatorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.qrCodeSignFeatureIsNotEnabled,
                description: 'QR code sign in feature is not enabled',
            }] as MessageError[];
            this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            return;
        }
        const qrCodeServerUrl = context.operatorConnectorState.systemSettings.find(x => x.name === SystemSettingsName.feature_qrcode_sign_in_server_public_url)?.value?.trim();
        const canParseUrl = URL.canParse(qrCodeServerUrl!);
        if (!canParseUrl) {
            operatorReplyMsg.header.failure = true;
            operatorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.qrCodeSignInFeatureUrlIsNotCorrect,
                description: 'QR code sign in feature URL is not correct. It must start with https://',
            }] as MessageError[];
            this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
            return;
        }

        const code = this.createUUIDString();
        const createdAt = this.getNowAsNumber();
        const codeSignIn: CodeSignIn = {
            code: code,
            connectionInstanceId: context.clientData.connectionInstanceId,
            createdAt: createdAt,
        };
        try {
            await context.cacheHelper.setCodeSignIn(codeSignIn);
            operatorReplyMsg.body.code = codeSignIn.code;
            operatorReplyMsg.body.remainingSeconds = context.operatorConnectorState.codeSignInDurationSeconds;
            const url = URL.parse(qrCodeServerUrl!)!;
            url.searchParams.append('sign-in-code', codeSignIn.code);
            url.searchParams.append('identifier-type', BusCodeSignInIdentifierType.user);
            operatorReplyMsg.body.url = url.toString();
            operatorReplyMsg.body.identifierType = BusCodeSignInIdentifierType.user;
        } catch (err) {
            context.logger.error('Error at processOperatorCreateSignInCodeRequestMessage', err);
            operatorReplyMsg.header.failure = true;
            operatorReplyMsg.header.errors = [{
                code: OperatorReplyMessageErrorCode.internalServerError,
                description: 'Internal server error',
            }] as MessageError[];
        }
        this.sendReplyMessageToOperator(context, operatorReplyMsg, message);
    }
}