import * as path from 'path';
import * as rollup from 'rollup';
import * as fg from 'fast-glob';
import {sucrase, nodeResolve, commonjs, replace, terser} from './plugins';
import {loadHTML} from './loadHTML';
import {removeSourceMapReference} from './removeSourceMapReference';
import {remove} from './remove';
import {forwardSlash} from './forwardSlash';
import {watch} from './watch';

export interface BuildOptions {
    src: string,
    dest: string,
    watch: boolean,
}

export const build = async (options: BuildOptions) => {
    const plugins = [
        replace(options.watch),
        loadHTML({baseDir: options.src}),
        removeSourceMapReference({include: ['**/node_modules/typesafe-actions/**']}),
        nodeResolve(),
        commonjs(),
        sucrase(),
    ];
    if (!options.watch) {
        plugins.push(terser());
    }
    const input = await fg(forwardSlash(path.join(options.src, '**/*.html')));
    const inputOptions: rollup.InputOptions = {input, plugins};
    const format = 'es';
    await remove(options.dest);
    if (options.watch) {
        await watch(inputOptions, {format, dir: options.dest});
    } else {
        const bundle = await rollup.rollup(inputOptions);
        await bundle.write({format, dir: options.dest});
    }
};
