import * as fs from 'fs';
import * as rollup from 'rollup';

export const emitFile = async (
    {context, name, file}: {
        context: rollup.PluginContext,
        name: string,
        file: string,
    },
): Promise<string> => {
    const referenceId = context.emitFile({
        type: 'asset',
        name,
        source: await fs.promises.readFile(file),
    });
    return context.getFileName(referenceId);
};
