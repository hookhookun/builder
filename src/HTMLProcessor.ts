import * as fs from 'fs';
import * as cheerio from 'cheerio';

export class HTMLProcessor {

    public readonly documents: Map<string, CheerioStatic>;

    public constructor() {
        this.documents = new Map();
    }

    public async process(
        htmlFilePath: string,
    ): Promise<string> {
        const html = await fs.promises.readFile(htmlFilePath, 'utf8');
        const $ = cheerio.load(html);
        this.documents.set(htmlFilePath, $);
        const localScripts = $('script[src^="."]').remove();
        const lines: Array<string> = [];
        for (const {attribs: {type, src}} of localScripts.toArray()) {
            if (!type || type.startsWith('text/javascript')) {
                lines.push(`import '${src}';`);
            }
        }
        return lines.join('\n');
    }

}
