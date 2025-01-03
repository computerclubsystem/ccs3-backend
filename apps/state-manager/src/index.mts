import { StateManager } from './state-manager.mjs';

const statusManager = new StateManager();
process.on('SIGTERM', async data => {
    console.warn('SIGTERM received');
    await statusManager.terminate();
    process.exit();
});
await statusManager.start();