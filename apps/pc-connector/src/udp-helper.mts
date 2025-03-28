import { createSocket, Socket } from 'node:dgram';

export class UdpHelper {
    private bindIpAddress?: string | null;

    setBindIpAddress(bindIpAddress: string | undefined | null): void {
        this.bindIpAddress = bindIpAddress;
    }

    send(buffer: Buffer, port: number, ipAddress: string): void {
        const socket = createSocket('udp4');
        if (!this.bindIpAddress) {
            this.sendToSocket(socket, buffer, port, ipAddress);
        } else {
            socket.bind({ address: this.bindIpAddress }, () => {
                this.sendToSocket(socket, buffer, port, ipAddress);
            });
        }
    }

    private sendToSocket(socket: Socket, buffer: Buffer, port: number, ipAddress: string): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        socket.send(buffer, port, ipAddress, (error, bytes) => {
            socket.close();
        });
    }
}
