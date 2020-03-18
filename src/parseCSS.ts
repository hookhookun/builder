import * as fs from 'fs';
import * as postcss from 'postcss';
import * as nested from 'postcss-nested';
import * as cssnano from 'cssnano';

export const parseCSS = async (
    cssFilePath: string,
    css?: string,
): Promise<postcss.Root> => {
    const {root} = await postcss([nested(), cssnano()]).process(
        css || await fs.promises.readFile(cssFilePath, 'utf8'),
        {from: cssFilePath},
    );
    if (!root) {
        throw new Error(`NoRoot: ${cssFilePath}`);
    }
    return root;
};
