import { QRCodeSignIn } from './qrcode-signin.mjs';

const qrSignIn = new QRCodeSignIn();
process.on('SIGTERM', async data => {
    console.warn('SIGTERM received', data);
    await qrSignIn.terminate();
    process.exit();
});
await qrSignIn.start();
