import * as path from 'path';
import * as fs from 'fs';
import * as rollup from 'rollup';
import {relativeURL} from './relativeURL';

export const replaceReference = async (
    {
        context,
        directory,
        pathToRoot,
        element: {tagName, attribs},
        attribute,
    }: {
        context: rollup.PluginContext,
        pathToRoot: string,
        directory: string,
        element: CheerioElement,
        attribute: string,
    },
): Promise<void> => {
    if (tagName === 'a') {
        return;
    }
    const relativePath = attribs[attribute];
    const filePath = path.join(directory, relativePath);
    const source = await fs.promises.readFile(filePath).catch((error) => {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    });
    if (source) {
        const newPath = context.getFileName(context.emitFile({
            type: 'asset',
            source,
            name: path.basename(relativePath),
        }));
        attribs[attribute] = relativeURL(pathToRoot, newPath);
    }
};

export const replaceReferenceAll = async (
    props: {
        context: rollup.PluginContext,
        $: CheerioStatic,
        directory: string,
        pathToRoot: string,
    },
): Promise<void> => {
    const promises: Array<Promise<void>> = [];
    for (const attribute of ['href', 'src']) {
        props.$(`[${attribute}^="."]`).each((_, element) => {
            promises.push(replaceReference({...props, element, attribute}));
        });
    }
    await Promise.all(promises);
};
