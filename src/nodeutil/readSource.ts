import * as fs from 'fs';
import {httpsGet} from './httpsGet';
import {readStream} from './readStream';

const cache = new Map<string, Buffer>();

export const readSource = async (
    filePathOrURL: string,
): Promise<Buffer> => {
    if (filePathOrURL.startsWith('https://')) {
        let cached = cache.get(filePathOrURL);
        if (!cached) {
            cached = await readStream(await httpsGet(filePathOrURL));
            cache.set(filePathOrURL, cached);
        }
        return cached;
    } else {
        return fs.promises.readFile(filePathOrURL);
    }
};
