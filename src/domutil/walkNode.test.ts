import ava, {ExecutionContext} from 'ava';
import {JSDOM, DOMWindow} from 'jsdom';
import {walkNode} from './walkNode';

const test = (
    html: string,
    callback: (t: ExecutionContext, window: DOMWindow) => void | Promise<void>,
): void => {
    ava(`walkNode: ${html}`, async (t) => {
        const {window} = new JSDOM(`<!doctype html>${html}`, {
            url: 'https://example.com',
        });
        Object.assign(global, {
            Node: window.Node,
        });
        await callback(t, window);
    });
};

test(
    '<p>AAA</p>',
    (t, {document}) => {
        const results = [];
        for (const step of walkNode(document.body)) {
            results.push(step);
        }
        const {body} = document;
        const p = body.querySelector('p') as Node;
        const text: Text = p.firstChild as Text;
        t.deepEqual(results, [
            {
                type: walkNode.Enter,
                node: document.body,
            },
            {
                type: walkNode.Enter,
                node: p,
            },
            {
                type: walkNode.Text,
                node: text,
            },
            {
                type: walkNode.Leave,
                node: p,
            },
            {
                type: walkNode.Leave,
                node: document.body,
            },
        ]);
    },
);