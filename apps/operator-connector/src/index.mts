import { OperatorConnector } from './operator-connector.mjs';

const operatorConnector = new OperatorConnector();
process.on('SIGTERM', async data => {
    console.warn('SIGTERM received', data);
    await operatorConnector.terminate();
    process.exit();
});
await operatorConnector.start();
