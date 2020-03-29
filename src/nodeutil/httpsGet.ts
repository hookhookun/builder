import * as https from 'https';
import * as http from 'http';

export const httpsGet = async (
    url: string,
): Promise<http.IncomingMessage> => await new Promise((resolve, reject) => {
    https.get(url)
    .once('error', reject)
    .once('response', resolve);
});
