export class Logger {
    private output = console;
    private prefix?: string;
    private messageFilter?: string | null;

    setMessageFilter(messageFilter: string | undefined | null): void {
        this.messageFilter = messageFilter;
    }

    log(message: string, ...params: unknown[]): void {
        this.outputMessage(this.output.log, message, ...params);
    }

    warn(message: string, ...params: unknown[]): void {
        this.outputMessage(this.output.warn, message, ...params);
    }

    error(message: string, ...params: unknown[]): void {
        this.outputMessage(this.output.error, message, ...params);
    }

    /**
     * Sets prefix text for all messages
     * @param text The text that must be added before each message
     */
    setPrefix(text: string): void {
        this.prefix = text;
    }

    private outputMessage(func: typeof this.output.log, message: string, ...params: unknown[]): void {
        if (this.messageFilter) {
            // Message filter is defined
            if (message.indexOf(this.messageFilter) === -1) {
                // The message does not contain the message filter - do not log
                return;
            }
        }
        func(this.addTime(message), ...params);
    }

    private addTime(message: string): string {
        return `${new Date().toISOString()} : ${message}`;
    }
}