import * as crypto from 'crypto';

export const getHash = (
    data: string | Buffer,
    algorithm = 'sha256',
    length = 8,
): string => {
    const hash = crypto.createHash(algorithm);
    hash.update(data);
    return hash.digest('hex').slice(0, length);
};
