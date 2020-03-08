import * as http from 'http';
import {serveFile} from './serveFile';
import {ClientList} from './ClientList';

export const handleRequest = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    props: {
        documentRoot: string,
        eventSourceEndpoint: string,
        clientList: ClientList,
    },
) => {
    console.log(`${req.method} ${req.url}`);
    if (req.url === props.eventSourceEndpoint) {
        props.clientList.connect(req, res);
        return;
    }
    await serveFile(req, res, props);
};
