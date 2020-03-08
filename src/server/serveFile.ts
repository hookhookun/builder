import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as stream from 'stream';
import {getContentType} from './getContentType';
import {getReloadScript} from './getReloadScript';
import {findFile} from './findFile';

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
    const {filePath, stats} = await findFile(path.join(props.documentRoot, req.url));
    const contentType = getContentType(filePath);
    const promise = new Promise((resolve, reject) => {
        res
        .once('error', reject)
        .once('finish', resolve);
    });
    const headers = {
        'content-type': contentType,
        'content-length': stats.size,
    };
    if (contentType.startsWith('text/html')) {
        const snippet = Buffer.from([
            '<script>',
            await getReloadScript(props.eventSourceEndpoint),
            '</script>',
        ].join(''));
        headers['content-length'] += snippet.length;
        res.writeHead(200, headers);
        fs.createReadStream(filePath)
        .pipe(new stream.Transform({
            transform(chunk, _encoding, callback) {
                this.push(chunk);
                callback();
            },
            flush(callback) {
                this.push(snippet);
                callback();
            },
        }))
        .pipe(res);
    } else {
        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
    }
    await promise;
};
