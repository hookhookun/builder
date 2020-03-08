import * as rollup from 'rollup';
import MagicString from 'magic-string';
import {createFilter} from 'rollup-pluginutils';

export const removeSourceMapReference = (
    props: {
        include?: Parameters<typeof createFilter>[0],
        exclude?: Parameters<typeof createFilter>[1],
    } = {},
): rollup.Plugin => {
    const filter = createFilter(props.include, props.exclude);
    return {
        name: 'RemoveSourceMapReference',
        transform(code, id) {
            if (filter(id)) {
                const matched = (/\/\/\s*#\s*sourceMappingURL=\S+\s*[\r\n]?/).exec(code);
                if (matched) {
                    const s = new MagicString(code);
                    const {0: comment, index}= matched;
                    s.remove(index, index + comment.length);
                    return {
                        code: s.toString(),
                        map: s.generateMap(),
                    };
                }
            }
            return null;
        },
    };
};
