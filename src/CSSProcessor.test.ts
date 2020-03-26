import * as path from 'path';
import * as os from 'os';
import ava from 'ava';
import {CSSProcessor} from './CSSProcessor';

ava('Minify className', async (t) => {
    const cssPath = path.join(os.tmpdir(), `css${Date.now().toString(34)}.css`);
    const css = '.container{width:100%}';
    const processor = new CSSProcessor({minify: true});
    const result = await processor.process(cssPath, css);
    t.deepEqual(result.map, new Map([
        ['container', '_1'],
    ]));
    const minified = await processor.concatenate();
    t.is(minified, '._1{width:100%}');
});

ava('Minify keyframes name', async (t) => {
    const cssPath = path.join(os.tmpdir(), `css${Date.now().toString(34)}.css`);
    const css = [
        '@keyframes FadeIn{0%{opacity:0}100%{opacity:1}}',
        '.FadeIn{animation:1s FadeIn}',
        '.ABC{animation-name:FadeIn}',
    ].join('');
    const processor = new CSSProcessor({minify: true});
    const result = await processor.process(cssPath, css);
    t.deepEqual(result.map, new Map([
        ['FadeIn', '_1'],
        ['ABC', '_2'],
    ]));
    const minified = await processor.concatenate();
    t.is(minified, [
        '@keyframes _1{0%{opacity:0}to{opacity:1}}',
        '._1{animation:1s _1}',
        '._2{animation-name:_1}',
    ].join(''));
});
