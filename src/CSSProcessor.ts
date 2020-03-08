import * as postcss from 'postcss';
import * as selectorParser from 'postcss-selector-parser';
import {createIdentifier} from './createIdentifier';
import {parseCSS} from './parseCSS';

export class CSSProcessor {

    private readonly roots: Map<string, postcss.Root>;

    private readonly identify: ReturnType<typeof createIdentifier>;

    public constructor() {
        this.roots = new Map();
        this.identify = createIdentifier();
    }

    public async process(
        cssFilePath: string,
    ): Promise<string> {
        const root = await parseCSS(cssFilePath);
        const classNameMapping: {[name: string]: string} = {};
        const processor = selectorParser();
        root.walkRules((rule) => {
            const selector = processor.astSync(rule.selector);
            selector.walkClasses((className) => {
                if (className.type === 'class') {
                    const {value: originalName} = className;
                    const classId = this.identify(`${cssFilePath}-${originalName}`);
                    const newName = `${originalName}-${classId}`;
                    classNameMapping[originalName] = newName;
                    className.replaceWith(selectorParser.className({value: newName}));
                }
            });
            rule.selector = `${selector}`;
        });
        this.roots.set(cssFilePath, root);
        return `export default ${JSON.stringify(classNameMapping, null, 4)};`;
    }

    public concatenate(): string {
        return [...this.roots.values()].join('\n');
    }

}
