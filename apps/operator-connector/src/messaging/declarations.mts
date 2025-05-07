import { RedisPubClient } from '@computerclubsystem/redis-client';
import { OperatorReplyMessage, OperatorRequestMessage } from '@computerclubsystem/types/messages/operators/declarations/operator.message.mjs';
import { WssServer } from '@computerclubsystem/websocket-server';
import { CacheHelper } from 'src/cache-helper.mjs';
import { ConnectedClientData, OperatorConnectorState, OperatorConnectorValidators } from 'src/declarations.mjs';
import { ErrorReplyHelper } from 'src/error-reply-helper.mjs';
import { Logger } from 'src/logger.mjs';
import { SubjectsService } from 'src/subjects.service.mjs';

export interface ProcessOperatorRequestMessageContext {
    message: OperatorRequestMessage<unknown>;
    clientData: ConnectedClientData;
    messageBusReplyTimeout: number;
    messageBusIdentifier: string;
    tokenExpirationMilliseconds: number;
    pingInterval: number;
    logger: Logger;
    wssServer: WssServer;
    subjectsService: SubjectsService;
    publishClient: RedisPubClient;
    cacheHelper: CacheHelper;
    errorReplyHelper: ErrorReplyHelper;
    operatorConnectorState: OperatorConnectorState;
    operatorConnectorValidators: OperatorConnectorValidators;
}

export interface OperatorRequestMessageHandlerResult {
    replyMessage?: OperatorReplyMessage<unknown> | null;
}

export interface OperatorRequestMessageHandler {
    handle(context: ProcessOperatorRequestMessageContext): Promise<OperatorRequestMessageHandlerResult | void>;
}
