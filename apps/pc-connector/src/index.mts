import { PcConnector } from './pc-connector.mjs';

const deviceConnector = new PcConnector();
await deviceConnector.start();
