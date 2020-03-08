import * as path from 'path';
import * as fs from 'fs';
import * as rollup from 'rollup';
import * as cheerio from 'cheerio';
import {CSSProcessor} from './CSSProcessor';
import {HTMLProcessor} from './HTMLProcessor';
import {forwardSlash} from './forwardSlash';

const emitCSS = (
    context: rollup.PluginContext,
    cssProcessor: CSSProcessor,
) => {
    const css = cssProcessor.concatenate();
    const referenceId = context.emitFile({
        type: 'asset',
        source: css,
        name: 'app.css',
    });
    return context.getFileName(referenceId);
};

const copyReferencedFiles = async (
    context: rollup.PluginContext,
    $: CheerioStatic,
    directory: string,
) => {
    await Promise.all(['href', 'src'].map(async (attr) => {
        await Promise.all($(`[${attr}^="."]`).toArray().map(async ({attribs, tagName}) => {
            if (tagName === 'a') {
                return;
            }
            const relativePath = attribs[attr];
            const filePath = path.join(directory, relativePath);
            const source = await fs.promises.readFile(filePath)
            .catch((error) => {
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
                attribs[attr] = forwardSlash(path.relative(path.dirname(relativePath), newPath));
            }
        }));
    }));
};

export const loadHTML = (
    props: {
        baseDir: string,
    },
): rollup.Plugin => {
    const cssProcessor = new CSSProcessor();
    const htmlProcessor = new HTMLProcessor();
    return {
        name: 'LoadHTML',
        async load(id) {
            switch (path.extname(id)) {
                case '.html':
                    return await htmlProcessor.process(id);
                case '.css':
                    return await cssProcessor.process(id);
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
            const cssFileName = emitCSS(this, cssProcessor);
            await Promise.all(Object.values(bundle).map(async (chunk) => {
                if (chunk.type !== 'chunk' || !chunk.facadeModuleId) {
                    return;
                }
                let $ = htmlProcessor.documents.get(chunk.facadeModuleId);
                if (!$) {
                    return;
                }
                $ = cheerio.load($.html());
                await copyReferencedFiles(this, $, path.dirname(chunk.facadeModuleId));
                this.emitFile({
                    type: 'asset',
                    source: [
                        '<!doctype html>',
                        ($('head').html() || '').trim(),
                        `<link rel="stylesheet" href="./${cssFileName}">`,
                        ($('body').html() || '').trim(),
                        `<script src="./${chunk.fileName}" defer></script>`,
                    ].join('\n'),
                    fileName: path.relative(props.baseDir, chunk.facadeModuleId),
                });
            }));
        },
    };
};
