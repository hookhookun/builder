import * as rollup from 'rollup';
import {CSSProcessor} from '../CSSProcessor';

export const emitCSS = async (
    {context, cssProcessor, name}: {
        context: rollup.PluginContext,
        cssProcessor: CSSProcessor,
        name?: string,
    },
): Promise<string> => {
    const css = await cssProcessor.concatenate();
    const referenceId = context.emitFile({
        type: 'asset',
        source: css,
        name: name || 'style.css',
    });
    return context.getFileName(referenceId);
};
