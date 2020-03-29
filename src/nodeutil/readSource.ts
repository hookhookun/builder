import * as fs from 'fs';
import {httpsGet} from './httpsGet';
import {readStream} from './readStream';

export const readSource = async (
    filePathOrURL: string,
): Promise<Buffer> => {
    if (filePathOrURL.startsWith('https://')) {
        return await readStream(await httpsGet(filePathOrURL));
    } else {
        return fs.promises.readFile(filePathOrURL);
    }
};
