import * as path from 'path';
import * as rollup from 'rollup';
import {sucrase, nodeResolve, commonjs, replace, terser} from './plugins';
import {buildPage} from './buildPage';
import {removeSourceMapReference} from './removeSourceMapReference';
import {watch} from './watch';
import {glob} from './glob';

export interface BuildOptions {
    src: string,
    dest: string,
    watch: boolean,
    debug?: boolean,
}

export const build = async (options: BuildOptions) => {
    console.log(options);
    const plugins = [
        replace({'process.env.NODE_ENV': options.watch ? '\'\'' : '\'production\''}),
        buildPage({
            baseDir: options.src,
            production: !options.watch,
            debug: options.debug,
        }),
        removeSourceMapReference({include: ['**/node_modules/typesafe-actions/**']}),
        nodeResolve(),
        commonjs(),
        sucrase(),
    ];
    if (!options.watch) {
        plugins.push(terser());
    }
    const input = await glob(path.join(options.src, '**/*.html'));
    const inputOptions: rollup.InputOptions = {input, plugins};
    const format = 'system';
    if (options.watch) {
        await watch(inputOptions, {format, dir: options.dest});
    } else {
        const bundle = await rollup.rollup(inputOptions);
        await bundle.write({format, dir: options.dest});
    }
};
