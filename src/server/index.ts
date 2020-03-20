import * as http from 'http';
import {handleRequest} from './handleRequest';
import {ClientList} from './ClientList';

export interface ServerData {
    server: http.Server,
    clientList: ClientList,
}

export const startServer = async (
    documentRoot: string,
    port = 1234,
    eventSourceEndpoint = '/EventSource',
): Promise<ServerData> => {
    const clientList = new ClientList();
    const props = {documentRoot, eventSourceEndpoint, clientList};
    const server = http.createServer((req, res) => {
        handleRequest(req, res, props)
        .catch((error) => {
            console.error(error);
            if (!res.finished) {
                res.statusCode = 500;
                res.end();
            }
        });
    });
    await new Promise((resolve, reject) => {
        server
        .once('error', reject)
        .once('listening', () => {
            console.log(server.address());
            server.removeListener('error', reject);
            resolve();
        })
        .listen(port);
    });
    return {server, clientList};
};
