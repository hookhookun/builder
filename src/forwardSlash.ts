import * as path from 'path';

export const forwardSlash = (
    input: string,
): string => input.split(path.sep).join('/');
