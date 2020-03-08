import * as path from 'path';

export const relativeURL = (...fragments: Array<string>): string => {
    return path.join(...fragments).split(path.sep).join('/').replace(/^([^\.])/, './$1');
};
