import * as path from 'path';
import * as fs from 'fs';
import * as rollup from 'rollup';
import * as cheerio from 'cheerio';
import {CSSProcessor} from './CSSProcessor';
import {HTMLProcessor} from './HTMLProcessor';
import {relativeURL} from './relativeURL';

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

const replaceReference = async (
    {
        context,
        pathToRoot,
        directory,
        element: {tagName, attribs},
        attribute,
    }: {
        context: rollup.PluginContext,
        pathToRoot: string,
        directory: string,
        element: CheerioElement,
        attribute: string,
    },
) => {
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

const replaceReferences = async (
    props: {
        context: rollup.PluginContext,
        $: CheerioStatic,
        pathToRoot: string,
        directory: string,
    },
) => {
    await Promise.all(['href', 'src'].map(async (attribute) => {
        await Promise.all(props.$(`[${attribute}^="."]`).toArray()
        .map(async (element) => {
            await replaceReference({...props, element, attribute});
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
                if ($) {
                    $ = cheerio.load($.html());
                    const directory = path.dirname(chunk.facadeModuleId);
                    const pathToRoot = path.relative(directory, props.baseDir);
                    await replaceReferences({
                        context: this,
                        $,
                        pathToRoot,
                        directory,
                    });
                    this.emitFile({
                        type: 'asset',
                        source: [
                            '<!doctype html>',
                            ($('head').html() || '').trim(),
                            `<link rel="stylesheet" href="${relativeURL(pathToRoot, cssFileName)}">`,
                            ($('body').html() || '').trim(),
                            `<script src="${relativeURL(pathToRoot, chunk.fileName)}" defer></script>`,
                        ].join('\n'),
                        fileName: path.relative(props.baseDir, chunk.facadeModuleId),
                    });
                }
            }));
        },
    };
};
