import { ValueOf } from '@computerclubsystem/types/declarations.mjs';
import { Logger } from './logger.mjs';

export class ExitProcessManager {
    private map!: Map<ProcessExitCode, ProcessExitData>;
    private logger!: Logger;

    init(): void {
        this.map = this.createMap();
    }

    setLogger(logger: Logger): void {
        this.logger = logger;
    }

    exitProcess(exitCode: ProcessExitCode): void {
        this.logger.warn('Exiting process with exit code', exitCode);
        const exitData = this.getProcessExitData(exitCode);
        if (exitData) {
            this.logger.warn('Process exit description:', exitData.description);
        } else {
            this.logger.warn('Process exit code', exitCode, 'does not have exit data');
        }
        this.exit(exitCode);
    }

    private exit(exitCode: ProcessExitCode): void {
        process.exit(exitCode);
    }

    private createMap(): Map<ProcessExitCode, ProcessExitData> {
        const map = new Map<ProcessExitCode, ProcessExitData>();
        map.set(ProcessExitCode.maxPubClientErrorsReached, { description: 'Maximum PubClient errors reached' });
        map.set(ProcessExitCode.maxPubClientReconnectErrorsReached, { description: 'Maximum PubClient reconnect errors reached' });
        map.set(ProcessExitCode.maxSubClentErrorsReached, { description: 'Maximum SubClient errors reached' });
        map.set(ProcessExitCode.maxSubClientReconnectErrorsReached, { description: 'Maximum SubClient reconnect errors reached' });
        map.set(ProcessExitCode.success, { description: 'Exited without error' });
        return map;
    }

    private getProcessExitData(exitCode: ProcessExitCode): ProcessExitData | undefined {
        return this.map.get(exitCode);
    }
}

export interface ProcessExitData {
    description?: string;
}

export const ProcessExitCode = {
    success: 0,
    maxSubClentErrorsReached: 1,
    maxSubClientReconnectErrorsReached: 2,
    maxPubClientErrorsReached: 3,
    maxPubClientReconnectErrorsReached: 4,
    maxPubClientPublishErrorsReached: 5,
} as const;
export type ProcessExitCode = ValueOf<typeof ProcessExitCode>;
