import { UdpHelper } from './udp-helper.mjs';

interface CommandLineParameters {
    ipAddress: string;
    port: number;
    packet: string;
    resendInterval: number;
    bindIpAddress?: string;
}

const cmdLineParams = {} as CommandLineParameters;
for (let i = 2; i < process.argv.length; i++) {
    switch (process.argv[i]) {
        case '--ip-address':
            cmdLineParams.ipAddress = process.argv[++i];
            break;
        case '--port':
            cmdLineParams.port = +process.argv[++i];
            break;
        case '--packet':
            cmdLineParams.packet = process.argv[++i];
            break;
        case '--resend-interval':
            cmdLineParams.resendInterval = +process.argv[++i];
            break;
        case '--bind-ip-address':
            cmdLineParams.bindIpAddress = process.argv[++i];
            break;
    }
}

function hexStringToBuffer(hexString: string): Buffer {
    const arr: number[] = [];
    for (let i = 0; i < hexString.length - 1; i += 2) {
        const hex = hexString.substring(i, i + 2);
        arr.push(parseInt(hex, 16));
    }
    return Buffer.from(arr);
}

console.log('Using command line parameters', cmdLineParams);
console.log(`Sending to ${cmdLineParams.ipAddress}:${cmdLineParams.port}, packet ${cmdLineParams.packet}, resend interval ${cmdLineParams.resendInterval}, bind IP address ${cmdLineParams.bindIpAddress}`);

setInterval(() => {
    const udpHelper = new UdpHelper();
    udpHelper.setBindIpAddress(cmdLineParams.bindIpAddress);
    const buffer = hexStringToBuffer(cmdLineParams.packet);
    console.log(`${new Date().toISOString()} Sending`);
    udpHelper.send(buffer, cmdLineParams.port, cmdLineParams.ipAddress);
}, cmdLineParams.resendInterval * 1000);
