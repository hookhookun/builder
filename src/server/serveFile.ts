import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as stream from 'stream';
import {getContentType} from './getContentType';
import {getReloadScript} from './getReloadScript';

export const serveFile = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    props: {
        documentRoot: string,
        eventSourceEndpoint: string,
    },
) => {
    if (!req.url) {
        throw new Error(`NoURL: req.url is ${req.url}`);
    }
    const filePath = path.join(props.documentRoot, req.url.replace(/\/$/, '/index.html'));
    const stats = await fs.promises.stat(filePath);
    if (stats.isDirectory()) {
        res.writeHead(301, {location: `${req.url}/`});
        res.end();
        return;
    }
    const contentType = getContentType(filePath);
    const headers = {
        'content-type': contentType,
        'content-length': stats.size,
    };
    let source: stream.Readable = fs.createReadStream(filePath);
    if (contentType.startsWith('text/html')) {
        const reloadScript = await getReloadScript(props.eventSourceEndpoint);
        const snippet = Buffer.from(`\n<script>\n${reloadScript}\n</script>`);
        headers['content-length'] += snippet.length;
        source = source.pipe(new stream.Transform({
            transform(chunk, _encoding, callback) {
                this.push(chunk);
                callback();
            },
            flush(callback) {
                this.push(snippet);
                callback();
            },
        }));
    }
    const promise = new Promise((resolve, reject) => {
        res.once('error', reject).once('finish', resolve);
    });
    res.writeHead(200, headers);
    source.pipe(res);
    await promise;
};
