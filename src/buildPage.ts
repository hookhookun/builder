import * as path from 'path';
import * as fs from 'fs';
import * as rollup from 'rollup';
import {CSSProcessor} from './CSSProcessor';
import {HTMLProcessor} from './HTMLProcessor';
import {emitCSS} from './emitter/css';
import {emitHTML} from './emitter/html';
import {emitFile} from './emitter/file';
import {readSource} from './nodeutil/readSource';
import {getHash} from './nodeutil/getHash';

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
    const referencedFiles = new Set<rollup.EmittedFile>();
    return {
        name: 'BuildPage',
        async buildStart(): Promise<void> {
            if (props.debug) {
                this.addWatchFile(assets.baseCSS);
                this.addWatchFile(assets.polyfill);
                this.addWatchFile(assets.footer);
                this.addWatchFile(assets.favicon);
            }
            await cssProcessor.process(assets.baseCSS);
        },
        resolveId(importee): string | null {
            return importee.startsWith('https://') ? importee : null;
        },
        async load(id): Promise<rollup.LoadResult | null> {
            switch (path.extname(id)) {
                case '.ts':
                case '.js':
                case '.tsx':
                case '.jsx':
                    return null;
                case '.html':
                    return await htmlProcessor.generateScript(id);
                case '.css':
                    return await cssProcessor.generateScript(id);
                default:
            }
            const source = await readSource(id);
            const extname = path.extname(id);
            const basename = path.basename(id, extname);
            const hash = getHash(source);
            const fileName = `assets/${basename}-${hash}${extname}`;
            referencedFiles.add({type: 'asset', fileName, source});
            return `export default '${fileName}';`;
        },
        outputOptions(options): rollup.OutputOptions {
            return {
                ...options,
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
            };
        },
        async generateBundle(_options, bundle): Promise<void> {
            for (const file of referencedFiles) {
                this.emitFile(file);
            }
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
                    const promise = htmlProcessor.promises.get(chunk.facadeModuleId);
                    if (promise) {
                        const {$, dependencies} = await promise;
                        await emitHTML({
                            context: this,
                            $,
                            htmlFilePath: chunk.facadeModuleId,
                            baseDir: props.baseDir,
                            files: {systemjs, js: chunk.fileName, css, favicon},
                            header,
                            footer,
                            noScript: dependencies.every((dependency) => !(/\.[jt]s$/).test(dependency)),
                        });
                    }
                }
            }));
        },
        watchChange(id): void {
            htmlProcessor.promises.delete(id);
            cssProcessor.promises.delete(id);
        },
    };
};
