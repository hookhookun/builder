import * as fs from 'fs';
import * as path from 'path';

export const removeDirectory = async (
    directory: string,
): Promise<void> => {
    const dir = await fs.promises.opendir(directory);
    for await (const dirent of dir) {
        const filePath = path.join(directory, dirent.name);
        if (dirent.isDirectory()) {
            await removeDirectory(filePath);
        } else {
            await fs.promises.unlink(filePath);
        }
    }
};

export const remove = async (
    filePath: string,
): Promise<void> => {
    const stats = await fs.promises.stat(filePath)
    .catch((error) => {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    });
    if (stats) {
        if (stats.isDirectory()) {
            await removeDirectory(filePath);
        } else {
            await fs.promises.unlink(filePath);
        }
    }
};
