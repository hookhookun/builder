import * as path from 'path';
import * as fs from 'fs';

export const findFile = async (
    candidate: string,
) => {
    let filePath = candidate;
    let stats = await fs.promises.stat(filePath);
    if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        stats = await fs.promises.stat(filePath);
    }
    return {filePath, stats};
};
