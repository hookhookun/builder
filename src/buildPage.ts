import * as path from 'path';
import * as fs from 'fs';
import * as rollup from 'rollup';
import {CSSProcessor} from './CSSProcessor';
import {HTMLProcessor} from './HTMLProcessor';
import {emitCSS} from './emitter/css';
import {emitHTML} from './emitter/html';
import {emitFile} from './emitter/file';

export interface BuildPageAssets {
    systemjs: string,
    polyfill: string,
    baseCSS: string,
    header: string,
    footer: string,
    favicon: string,
}

export interface BuildPagePluginProps {
    production: boolean,
    baseDir: string,
    assets?: Partial<BuildPageAssets>,
    debug?: boolean,
}

export const buildPage = (props: BuildPagePluginProps): rollup.Plugin => {
    const cssProcessor = new CSSProcessor({minify: props.production});
    const htmlProcessor = new HTMLProcessor({cssProcessor});
    const assets: BuildPageAssets = {
        systemjs: require.resolve('systemjs/dist/s.min.js'),
        polyfill: path.join(__dirname, '../files/polyfill.js'),
        baseCSS: path.join(__dirname, '../files/base.css'),
        header: path.join(__dirname, '../files/header.html'),
        footer: path.join(__dirname, '../files/footer.html'),
        favicon: path.join(__dirname, '../files/favicon.png'),
        ...props.assets,
    };
    return {
        name: 'BuildPage',
        async buildStart() {
            if (props.debug) {
                this.addWatchFile(assets.baseCSS);
                this.addWatchFile(assets.polyfill);
                this.addWatchFile(assets.footer);
                this.addWatchFile(assets.favicon);
            }
            await cssProcessor.process(assets.baseCSS);
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
            const [systemjs, css, favicon, header, footer] = await Promise.all([
                emitFile({
                    context: this,
                    name: 'env.js',
                    file: [assets.polyfill, assets.systemjs],
                }),
                emitCSS({context: this, cssProcessor}),
                emitFile({
                    context: this,
                    name: 'favicon.png',
                    file: assets.favicon,
                }),
                fs.promises.readFile(assets.header, 'utf8'),
                fs.promises.readFile(assets.footer, 'utf8'),
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
                            header,
                            footer,
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
