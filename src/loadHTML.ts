import * as path from 'path';
import * as fs from 'fs';
import * as rollup from 'rollup';
import * as cheerio from 'cheerio';
import {CSSProcessor, ClassNameMapping} from './CSSProcessor';
import {HTMLProcessor} from './HTMLProcessor';
import {relativeURL} from './relativeURL';

const emitCSS = async (
    {context, cssProcessor}: {
        context: rollup.PluginContext,
        cssProcessor: CSSProcessor,
    },
) => {
    const css = await cssProcessor.concatenate();
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
        production: boolean,
        baseDir: string,
    },
): rollup.Plugin => {
    const cssProcessor = new CSSProcessor({minify: props.production});
    const htmlProcessor = new HTMLProcessor();
    return {
        name: 'LoadHTML',
        async load(id) {
            switch (path.extname(id)) {
                case '.html': {
                    const {$, dependencies} = await htmlProcessor.process(id);
                    const directory = path.dirname(id);
                    const classNames: ClassNameMapping = new Map();
                    await Promise.all(dependencies.map(async (dependency) => {
                        if (path.extname(dependency) === '.css') {
                            const cssFilePath = path.join(directory, dependency);
                            const {map} = await cssProcessor.process(cssFilePath);
                            for (const [key, value] of map) {
                                classNames.set(key, value);
                            }
                        }
                    }));
                    for (const {attribs} of $('[class]').toArray()) {
                        attribs.class = attribs.class.trim().split(/\s+/)
                        .map((name) => classNames.get(name) || name)
                        .join(' ');
                    }
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
            const cssFileName = await emitCSS({context: this, cssProcessor});
            await Promise.all(Object.values(bundle).map(async (chunk) => {
                if (chunk.type !== 'chunk' || !chunk.facadeModuleId) {
                    return;
                }
                let promise = htmlProcessor.promises.get(chunk.facadeModuleId);
                if (promise) {
                    const $ = cheerio.load((await promise).$.html());
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
        watchChange(id) {
            htmlProcessor.promises.delete(id);
            cssProcessor.promises.delete(id);
        },
    };
};
