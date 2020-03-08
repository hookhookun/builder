import * as fs from 'fs';
import * as path from 'path';

const cache = new Map<string, Promise<string>>();

export const generateReloadScript = async (
    endpoint: string,
) => {
    const scriptPath = path.join(__dirname, 'reload.js');
    const code = await fs.promises.readFile(scriptPath, 'utf8');
    return code.replace(/\{\{ENDPOINT\}\}/, endpoint);
};

export const getReloadScript = async (
    endpoint: string,
): Promise<string> => {
    let promise = cache.get(endpoint);
    if (!promise) {
        promise = generateReloadScript(endpoint);
    }
    return await promise;
};
