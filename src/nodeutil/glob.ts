import * as path from 'path';
import * as fg from 'fast-glob';

export const glob = async (
    pattern: string,
    options?: fg.Options,
): Promise<Array<string>> => await fg(
    pattern.split(path.sep).join('/'),
    options,
);
