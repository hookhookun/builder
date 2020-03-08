import * as http from 'http';
import {handleRequest} from './handleRequest';
import {ClientList} from './ClientList';

export const startServer = async (
    documentRoot: string,
    port = 1234,
    eventSourceEndpoint = '/EventSource',
) => {
    const clientList = new ClientList();
    const server = http.createServer((req, res) => {
        handleRequest(req, res, {documentRoot, eventSourceEndpoint, clientList})
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
