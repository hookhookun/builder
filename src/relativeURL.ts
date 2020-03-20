import * as path from 'path';

export const relativeURL = (
    ...fragments: Array<string>
): string => path.join(...fragments)
.split(path.sep)
.join('/')
.replace(/^([^.])/, './$1');
