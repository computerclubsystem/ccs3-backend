import { PcConnector } from './pc-connector.mjs';

const pcConnector = new PcConnector();
process.on('SIGTERM', async data => {
    console.warn('SIGTERM received', data);
    await pcConnector.terminate();
    process.exit();
});
await pcConnector.start();
