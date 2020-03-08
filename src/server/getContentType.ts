import * as path from 'path';

export const getContentType = (
    filePath: string,
): string => {
    switch (path.extname(filePath)) {
        case '.html':
            return 'text/html';
        case '.js':
            return 'text/javascript';
        case '.css':
            return 'text/css';
        default:
            return 'text/plain';
    };
};
