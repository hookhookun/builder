import test from 'ava';
import {parsePNG} from './parsePNG';
import {Base64} from './base64';

const png8x6 = Base64.decode('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAMAAADJ2y/JAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURQAAAJkvWcxyr4QuUbl2rbROgaxEdrVbmq5PhrNWkXwlPKZEd5pDWqg+aFYxOrlamKA9a5YzYJ1DgpdRiZAmUGE9S7Zhhq1Wd29cwz8AAAABdFJOUwBA5thmAAAANklEQVQI1xXGWwKAIAgEwFVBIFLLR93/puV8DdhLwBZN/Tx2xJRzBbo0U13AfcnvTZhhENGTPiK+AYD2ttbOAAAAAElFTkSuQmCC');

test('Load an 8x6 png image', (t) => {
    const result = [...parsePNG(png8x6)];
    t.deepEqual(
        result,
        [
            {
                crc: 3386585033,
                dataEnd: 29,
                dataLength: 13,
                dataStart: 16,
                end: 33,
                start: 8,
                type: 'IHDR',
            },
            {
                crc: 201089285,
                dataEnd: 45,
                dataLength: 4,
                dataStart: 41,
                end: 49,
                start: 33,
                type: 'gAMA',
            },
            {
                crc: 2932743401,
                dataEnd: 58,
                dataLength: 1,
                dataStart: 57,
                end: 62,
                start: 49,
                type: 'sRGB',
            },
            {
                crc: 1868350271,
                dataEnd: 142,
                dataLength: 72,
                dataStart: 70,
                end: 146,
                start: 62,
                type: 'PLTE',
            },
            {
                crc: 1088870502,
                dataEnd: 155,
                dataLength: 1,
                dataStart: 154,
                end: 159,
                start: 146,
                type: 'tRNS',
            },
            {
                crc: 4139177678,
                dataEnd: 221,
                dataLength: 54,
                dataStart: 167,
                end: 225,
                start: 159,
                type: 'IDAT',
            },
            {
                crc: 2923585666,
                dataEnd: 233,
                dataLength: 0,
                dataStart: 233,
                end: 237,
                start: 225,
                type: 'IEND',
            },
        ],
    );
});
