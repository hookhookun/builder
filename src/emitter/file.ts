import * as fs from 'fs';
import * as rollup from 'rollup';
import {ensureArray} from '../util/ensureArray';

export const emitFile = async (
    {context, name, file}: {
        context: rollup.PluginContext,
        name: string,
        file: string | Array<string>,
    },
): Promise<string> => {
    const referenceId = context.emitFile({
        type: 'asset',
        name,
        source: Buffer.concat(await Promise.all(ensureArray(file).map(async (file) => {
            return await fs.promises.readFile(file);
        }))),
    });
    return context.getFileName(referenceId);
};
