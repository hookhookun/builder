const Text: 0 = 0;
const Enter: 1 = 1;
const Leave: 2 = 2;

export type WalkStep<ElementType extends Element> =
| {type: typeof Leave, node: ElementType}
| {type: typeof Enter, node: ElementType}
| {type: typeof Text, node: Text};

export const isTextNode = (node: Node): node is Text => node.nodeType === Node.TEXT_NODE;

export const walkNode = Object.assign(
    function* <ElementType extends Element>(node: Node): Generator<WalkStep<ElementType>> {
        if (isTextNode(node)) {
            yield {type: Text, node};
        } else {
            yield {type: Enter, node: node as ElementType};
            for (const childNode of node.childNodes) {
                yield* walkNode<ElementType>(childNode);
            }
            yield {type: Leave, node: node as ElementType};
        }
    },
    {
        Enter,
        Text,
        Leave,
        stringifyStep: (step: WalkStep<Element>): string => {
            let result = '';
            switch (step.type) {
                case Text:
                    result += ' Text';
                    break;
                case Enter:
                    result += 'Enter';
                    break;
                case Leave:
                    result += 'Leave';
                    break;
                default:
            }
            result += ': ';
            if (step.type === Text) {
                result += step.node.textContent;
            } else {
                result += step.node.tagName;
            }
            return result;
        },
    },
);

export const walkNodeContents = <ElementType extends Element>(element: Node): Generator<WalkStep<ElementType>> => {
    const walker = walkNode<ElementType>(element);
    walker.next();
    return walker;
};
