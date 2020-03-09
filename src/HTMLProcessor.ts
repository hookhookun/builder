import * as path from 'path';
import {CSSProcessor} from './CSSProcessor';
import {loadHTML} from './loadHTML';

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
        if (this.cssProcessor) {
            const directory = path.dirname(htmlFilePath);
            const cssFiles: Array<string> = [];
            for (const dependency of dependencies) {
                if (path.extname(dependency) === '.css') {
                    cssFiles.push(path.join(directory, dependency));
                }
            }
            const classNameMapping = await this.cssProcessor.getMapping(cssFiles);
            $('[class]').each((_, {attribs}) => {
                attribs.class = attribs.class.trim().split(/\s+/)
                .map((name) => classNameMapping.get(name) || name)
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
