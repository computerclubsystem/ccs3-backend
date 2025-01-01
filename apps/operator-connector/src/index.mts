import { OperatorConnector } from './operator-connector.mjs';

const deviceConnector = new OperatorConnector();
process.on('SIGTERM', data => {
    console.log('SIGTERM received', data);
});
await deviceConnector.start();
