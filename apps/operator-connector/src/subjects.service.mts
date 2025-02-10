import { Observable, Subject } from 'rxjs';

import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { MessageStatItem } from './declarations.mjs';

export class SubjectsService {
    private readonly operatorsChannelBusMessageReceivedSubject = new Subject<Message<unknown>>();
    private readonly sharedChannelBusMessageReceivedSubject = new Subject<Message<unknown>>();
    private readonly messageStatSubject = new Subject<MessageStatItem>();

    setSharedChannelBusMessageReceived(message: Message<unknown>): void {
        this.sharedChannelBusMessageReceivedSubject.next(message);
    }

    getSharedChannelBusMessageReceived(): Observable<Message<unknown>> {
        return this.sharedChannelBusMessageReceivedSubject.asObservable();
    }

    setMessageStat(msgStatItem: MessageStatItem): void {
        this.messageStatSubject.next(msgStatItem);
    }

    getMessageStat(): Observable<MessageStatItem> {
        return this.messageStatSubject.asObservable();
    }

    setOperatorsChannelBusMessageReceived(message: Message<unknown>): void {
        this.operatorsChannelBusMessageReceivedSubject.next(message);
    }

    getOperatorsChannelBusMessageReceived(): Observable<Message<unknown>> {
        return this.operatorsChannelBusMessageReceivedSubject.asObservable();
    }
}
