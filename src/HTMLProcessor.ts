import * as fs from 'fs';
import * as cheerio from 'cheerio';

export interface HTMLProcessorResult {
    $: CheerioStatic,
    dependencies: Array<string>,
}

export class HTMLProcessor {

    public readonly promises: Map<string, Promise<HTMLProcessorResult>>;

    public constructor() {
        this.promises = new Map();
    }

    private async $process(htmlFilePath: string): Promise<HTMLProcessorResult> {
        const html = await fs.promises.readFile(htmlFilePath, 'utf8');
        const $ = cheerio.load(html);
        const localScripts = $('script[src^="."]').remove();
        const dependencies: Array<string> = [];
        for (const {attribs: {type, src}} of localScripts.toArray()) {
            if (!type || type.startsWith('text/javascript')) {
                dependencies.push(src);
            }
        }
        const localStyleSheets = $('link[href^="."][rel="stylesheet"]').remove();
        for (const {attribs: {href}} of localStyleSheets.toArray()) {
            dependencies.push(href);
        }
        return {$, dependencies};
    }

    public async process(
        htmlFilePath: string,
        noCache = false,
    ): Promise<HTMLProcessorResult> {
        let promise = this.promises.get(htmlFilePath);
        if (!promise || noCache) {
            promise = this.$process(htmlFilePath);
            this.promises.set(htmlFilePath, promise);
        }
        return await promise;
    }

    public async generateScript(htmlFilePath: string): Promise<string> {
        return (await this.process(htmlFilePath)).dependencies
        .map((ref) => `import '${ref}';`)
        .join('\n');
    }

}
