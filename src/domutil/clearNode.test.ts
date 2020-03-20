import ava, {ExecutionContext} from 'ava';
import {JSDOM, DOMWindow} from 'jsdom';
import {clearNode} from './clearNode';

const test = (
    html: string,
    callback: (t: ExecutionContext, window: DOMWindow) => void | Promise<void>,
): void => {
    ava(`clearNode: ${html}`, async (t) => {
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
        const {body} = document;
        const p = body.querySelector('p') as Node;
        t.is(p.parentNode, body);
        clearNode(body);
        t.is(p.parentNode, null);
    },
);