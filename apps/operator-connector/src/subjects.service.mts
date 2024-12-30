import { Observable, Subject } from 'rxjs';

import { Message } from '@computerclubsystem/types/messages/declarations/message.mjs';
import { MessageStatItem } from './declarations.mjs';

export class SubjectsService {
    private readonly operatorsChannelBusMessageReceivedSubject = new Subject<Message<any>>();
    private readonly operatorsChannelMessageStatSubject = new Subject<MessageStatItem>();

    setOperatorsChannelMessageStat(msgStatItem: MessageStatItem): void {
        this.operatorsChannelMessageStatSubject.next(msgStatItem);
    }

    getOperatorsChannelMessageStat(): Observable<MessageStatItem> {
        return this.operatorsChannelMessageStatSubject.asObservable();
    }

    setOperatorsChannelBusMessageReceived(message: Message<any>): void {
        this.operatorsChannelBusMessageReceivedSubject.next(message);
    }

    getOperatorsChannelBusMessageReceived(): Observable<Message<any>> {
        return this.operatorsChannelBusMessageReceivedSubject.asObservable();
    }
}
