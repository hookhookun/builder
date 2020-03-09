import * as path from 'path';
import {CSSProcessor} from './CSSProcessor';
import {loadHTML} from './loadHTML';
import {cheerioElementToString} from './cheerioElementToString';

export interface HTMLProcessorProps {
    cssProcessor?: CSSProcessor,
}

export interface HTMLProcessorResult {
    $: CheerioStatic,
    dependencies: Array<string>,
}

export class HTMLProcessor {

    public readonly promises: Map<string, Promise<HTMLProcessorResult>>;

    public readonly cssProcessor?: CSSProcessor;

    public constructor(props: HTMLProcessorProps) {
        this.promises = new Map();
        this.cssProcessor = props.cssProcessor;
    }

    private async $process(
        htmlFilePath: string,
    ): Promise<HTMLProcessorResult> {
        const $ = await loadHTML(htmlFilePath);
        const dependencies: Array<string> = [];
        $('script[src^="."]').remove().each((_, {attribs: {type, src}}) => {
            if (!type || type.startsWith('text/javascript')) {
                dependencies.push(src);
            }
        });
        $('link[href^="."][rel="stylesheet"]').remove().each((_, {attribs: {href}}) => {
            dependencies.push(href);
        });
        const {cssProcessor} = this;
        if (cssProcessor) {
            const directory = path.dirname(htmlFilePath);
            const mappings = await Promise.all(
                [
                    [
                        htmlFilePath,
                        $('style').remove().toArray().map(cheerioElementToString).join('\n'),
                    ],
                    ...dependencies
                    .filter((dependency) => path.extname(dependency) === '.css')
                    .map((dependency) => path.join(directory, dependency)),
                ]
                .map(async (entry) => {
                    const [file, css] = typeof entry === 'string' ? [entry] : entry;
                    return (await cssProcessor.process(file, css)).map;
                }),
            );
            $('[class]').each((_, {attribs}) => {
                attribs.class = attribs.class.trim().split(/\s+/)
                .map((name) => {
                    const replacements: Array<string> = [];
                    for (const mapping of mappings) {
                        const found = mapping.get(name);
                        if (found) {
                            replacements.push(found);
                        }
                    }
                    return replacements.join(' ') || name;
                })
                .join(' ');
            });
        }
        return {$, dependencies};
    }

    public async process(
        htmlFilePath: string,
    ): Promise<HTMLProcessorResult> {
        let promise = this.promises.get(htmlFilePath);
        if (!promise) {
            promise = this.$process(htmlFilePath);
            this.promises.set(htmlFilePath, promise);
        }
        return await promise;
    }

    public async generateScript(
        htmlFilePath: string,
    ): Promise<string> {
        return (await this.process(htmlFilePath)).dependencies
        .map((ref) => `import '${ref}';`)
        .join('\n');
    }

}
