import * as http from 'http';

export class ClientList {

    private readonly connections: Set<http.ServerResponse>;

    private timerId: ReturnType<typeof setInterval> | null;

    public constructor() {
        this.connections = new Set();
        this.timerId = null;
    }

    public connect(
        req: http.IncomingMessage,
        res: http.ServerResponse,
    ): void {
        const ua = req.headers['user-agent'];
        if (req.headers.accept === 'text/event-stream') {
            res.writeHead(200, {'content-type': 'text/event-stream'});
            res.write('retry: 5000\n\n');
            this.connections.add(res);
            res.once('close', () => this.disconnect(req, res));
            this.startTimer();
            console.log(`Connected: ${ua}`);
        } else {
            console.error(new Error(`InvalidAcceptHeader: ${req.headers.accept} (${ua})`));
        }
    }

    public disconnect(
        {headers}: http.IncomingMessage,
        res: http.ServerResponse
    ): void {
        this.connections.delete(res);
        console.log(`Disconnected: ${headers['user-agent']}`);
        this.stopTimer();
    }

    public broadcast(...messages: Array<string>): void {
        for (const connection of this.connections) {
            for (const message of messages) {
                connection.write(message);
            }
        }
    }

    private get connectionCount(): number {
        return this.connections.size;
    }

    private keepAlive(): void {
        this.broadcast(': keepalive\n\n');
    }

    private startTimer(): void {
        if (0 < this.connectionCount) {
            this.timerId = setInterval(() => {
                this.keepAlive();
            }, 10000);
        }
    }

    private stopTimer(): void {
        if (this.connectionCount === 0 && this.timerId) {
            clearInterval(this.timerId);
        }
    }

}
