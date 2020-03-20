import * as postcss from 'postcss';
import * as selectorParser from 'postcss-selector-parser';
import {createIdentifier} from './createIdentifier';
import {parseCSS} from './parseCSS';
import {generateIndentString} from './util/generateIndentString';

export type ClassNameMapping = Map<string, string>;

export interface CSSProcessorResult {
    root: postcss.Root,
    map: ClassNameMapping,
}

export class CSSProcessor {

    public readonly minify: boolean;

    public readonly promises: Map<string, Promise<CSSProcessorResult>>;

    private readonly identify: ReturnType<typeof createIdentifier>;


    public constructor(options: {minify?: boolean}) {
        this.minify = Boolean(options.minify);
        this.promises = new Map();
        this.identify = createIdentifier();
    }

    private getName(
        name: string,
        id: number,
    ): string {
        const suffix = id.toString(34);
        return this.minify ? `_${suffix}` : `${name}_${suffix}`;
    }

    private async $process(
        cssFilePath: string,
        css?: string,
    ): Promise<CSSProcessorResult> {
        const root = await parseCSS(cssFilePath, css);
        const map: ClassNameMapping = new Map();
        const processor = selectorParser();
        root.walkRules((rule) => {
            const selector = processor.astSync(rule.selector);
            selector.walkClasses((className) => {
                if (className.type === 'class') {
                    const {value: originalName} = className;
                    const id = this.identify(`${cssFilePath} ${originalName}`);
                    const newName = this.getName(originalName, id);
                    map.set(originalName, newName);
                    className.replaceWith(selectorParser.className({value: newName}));
                }
            });
            rule.selector = `${selector}`;
        });
        return {root, map};
    }

    public async process(
        cssFilePath: string,
        css?: string,
    ): Promise<CSSProcessorResult> {
        let promise = this.promises.get(cssFilePath);
        if (!promise) {
            promise = this.$process(cssFilePath, css);
            this.promises.set(cssFilePath, promise);
        }
        return await promise;
    }

    public async generateScript(
        cssFile: string,
        options: {
            exportName?: string,
            indent: number | string,
        } = {indent: 4},
    ): Promise<string> {
        const mapping = (await this.process(cssFile)).map;
        const indent = generateIndentString(options.indent);
        const lines: Array<string> = [
            `export ${options.exportName ? `const ${options.exportName} =` : 'default'} {`,
        ];
        for (const [from, to] of mapping) {
            lines.push(`${indent}'${from}': '${to}',`);
        }
        lines.push('};');
        return lines.join('\n');
    }

    public async concatenate(): Promise<string> {
        return (await Promise.all([...this.promises.values()]))
        .map(({root}) => `${root}`)
        .join('\n');
    }

}
