import { createSocket } from 'node:dgram';

export class UdpHelper {
    send(buffer: Buffer, port: number, ipAddress: string): void {
        const socket = createSocket('udp4');
        socket.send(buffer, port, ipAddress, () => {
            socket.close();
        });
    }
}
