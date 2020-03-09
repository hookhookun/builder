import * as path from 'path';
import * as rollup from 'rollup';
import * as cheerio from 'cheerio';
import {relativeURL} from '../relativeURL';
import {replaceReferenceAll} from '../replaceReference';

export const emitHTML = async (
    {context, $: $$, htmlFilePath, baseDir, header, footer, files, noScript}: {
        context: rollup.PluginContext,
        $: CheerioStatic,
        htmlFilePath: string,
        baseDir: string,
        header: string,
        footer: string,
        files: {
            systemjs: string,
            js: string,
            css: string,
            favicon: string,
        },
        noScript?: boolean,
    },
) => {
    const $ = cheerio.load($$.html());
    const directory = path.dirname(htmlFilePath);
    const pathToRoot = path.relative(directory, baseDir);
    await replaceReferenceAll({context, $, directory, pathToRoot});
    const $head = $('head');
    const parts = [
        header,
        ($head.html() || '').trim(),
    ];
    if ($head.find('link[rel=favicon]').length === 0) {
        parts.push(`<link rel="icon" type="image/png" href="${relativeURL(pathToRoot, files.favicon)}">`);
    }
    parts.push(
        `<link rel="stylesheet" href="${relativeURL(pathToRoot, files.css)}">`,
        ($('body').html() || '').trim(),
        footer,
    );
    if (!noScript) {
        parts.push(
            `<script src="${relativeURL(pathToRoot, files.systemjs)}"></script>`,
            `<script>System.import('${relativeURL(pathToRoot, files.js)}')</script>`,
        );
    }
    context.emitFile({
        type: 'asset',
        source: parts.join('\n'),
        fileName: path.relative(baseDir, htmlFilePath),
    });
};
