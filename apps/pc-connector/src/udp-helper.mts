import { createSocket } from 'node:dgram';

export class UdpHelper {
    send(buffer: Buffer, port: number, ipAddress: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const socket = createSocket('udp4');
            socket.send(buffer, port, ipAddress, (error: Error | null, bytes: number) => {
                socket.close();
                if (error) {
                    return reject(error);
                }
                return resolve(bytes);
            });
        });
    }
}
