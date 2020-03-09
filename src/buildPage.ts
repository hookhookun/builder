import * as path from 'path';
import * as rollup from 'rollup';
import {CSSProcessor} from './CSSProcessor';
import {HTMLProcessor} from './HTMLProcessor';
import {emitCSS} from './emitter/css';
import {emitHTML} from './emitter/html';
import {emitFile} from './emitter/file';

export interface BuildPagePluginProps {
    production: boolean,
    baseDir: string,
}

export const buildPage = (props: BuildPagePluginProps): rollup.Plugin => {
    const assetDirectory = path.join(__dirname, '../files');
    const cssProcessor = new CSSProcessor({minify: props.production});
    const htmlProcessor = new HTMLProcessor({cssProcessor});
    return {
        name: 'BuildPage',
        async buildStart() {
            const baseCSSFilePath = path.join(assetDirectory, 'base.css');
            await cssProcessor.process(baseCSSFilePath);
        },
        async load(id) {
            switch (path.extname(id)) {
                case '.html': {
                    return await htmlProcessor.generateScript(id);
                }
                case '.css':
                    return await cssProcessor.generateScript(id);
                default:
                    return null;
            }
        },
        outputOptions(options) {
            return {
                ...options,
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
            };
        },
        async generateBundle(_options, bundle) {
            const [systemjs, css, favicon] = await Promise.all([
                emitFile({
                    context: this,
                    name: 'system.js',
                    file: require.resolve('systemjs/dist/s.min.js'),
                }),
                emitCSS({context: this, cssProcessor}),
                emitFile({
                    context: this,
                    name: 'favicon.png',
                    file: path.join(assetDirectory, 'favicon.png'),
                }),
            ]);
            await Promise.all(Object.values(bundle).map(async (chunk) => {
                if (chunk.type === 'chunk' && chunk.facadeModuleId) {
                    let promise = htmlProcessor.promises.get(chunk.facadeModuleId);
                    if (promise) {
                        await emitHTML({
                            context: this,
                            $: (await promise).$,
                            htmlFilePath: chunk.facadeModuleId,
                            baseDir: props.baseDir,
                            files: {systemjs, js: chunk.fileName, css, favicon},
                        });
                    }
                }
            }));
        },
        watchChange(id) {
            htmlProcessor.promises.delete(id);
            cssProcessor.promises.delete(id);
        },
    };
};
