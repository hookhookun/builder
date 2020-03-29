import * as rollup from 'rollup';
import {ensureArray} from '../util/ensureArray';
import {readSource} from '../nodeutil/readSource';

export const emitFile = async (
    {context, name, file}: {
        context: rollup.PluginContext,
        name: string,
        file: string | Array<string>,
    },
): Promise<string> => {
    const source = Buffer.concat(await Promise.all(ensureArray(file).map(readSource)));
    const referenceId = context.emitFile({
        type: 'asset',
        name,
        source,
    });
    return context.getFileName(referenceId);
};
