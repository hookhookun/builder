import * as path from 'path';
import * as rollup from 'rollup';
import {sucrase, nodeResolve, commonjs, replace, terser} from './plugins';
import {buildPage} from './buildPage';
import {removeSourceMapReference} from './removeSourceMapReference';
import {watch} from './watch';
import {glob} from './nodeutil/glob';
import {hookunResolve} from './hookunResolve';
import {remove} from './nodeutil/remove';

export interface BuildOptions {
    src: string,
    dest: string,
    watch: boolean,
    debug?: boolean,
}

export const build = async (options: BuildOptions): Promise<void> => {
    console.log('Builder', options);
    const plugins = [
        replace({'process.env.NODE_ENV': options.watch ? '\'\'' : '\'production\''}),
        hookunResolve(),
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
    const [input] = await Promise.all([
        glob(path.join(options.src, '**/*.html')),
        remove(options.dest),
    ]);
    const inputOptions: rollup.InputOptions = {input, plugins};
    const format = 'system';
    if (options.watch) {
        await watch(inputOptions, {format, dir: options.dest});
    } else {
        const bundle = await rollup.rollup(inputOptions);
        await bundle.write({format, dir: options.dest});
    }
};
