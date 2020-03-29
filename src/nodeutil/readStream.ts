import * as stream from 'stream';

export const readStream = async (
    source: stream.Readable,
): Promise<Buffer> => await new Promise((resolve, reject) => {
    const chunks: Array<Buffer> = [];
    let totalLength = 0;
    source
    .pipe(new stream.Writable({
        write(chunk: Buffer, _encoding, callback): void {
            chunks.push(chunk);
            totalLength += chunk.length;
            callback();
        },
        final(callback): void {
            callback();
            resolve(Buffer.concat(chunks, totalLength));
        },
    }))
    .once('error', reject);
});
