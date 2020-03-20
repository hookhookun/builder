import test from 'ava';
import {getPNGInfo} from './getPNGInfo';
import {Base64} from './base64';

const png8x6 = Base64.decode([
    'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAMAAADJ2y/JAAAABGdBTUEAALGPC/x',
    'hBQAAAAFzUkdCAK7OHOkAAABIUExURQAAAJkvWcxyr4QuUbl2rbROgaxEdrVbmq',
    '5PhrNWkXwlPKZEd5pDWqg+aFYxOrlamKA9a5YzYJ1DgpdRiZAmUGE9S7Zhhq1Wd',
    '29cwz8AAAABdFJOUwBA5thmAAAANklEQVQI1xXGWwKAIAgEwFVBIFLLR93/puV8',
    'DdhLwBZN/Tx2xJRzBbo0U13AfcnvTZhhENGTPiK+AYD2ttbOAAAAAElFTkSuQmCC'
].join(''));

test('Load an 8x6 png image', (t) => {
    const result = getPNGInfo(png8x6);
    t.deepEqual(
        result,
        {
            width: 8,
            height: 6,
            bitDepth: 8,
            colorType: 3,
            compressionMethod: 0,
            filterMethod: 0,
            interlaceMethod: 0,
        },
    );
});
