import ava from 'ava';
import {Base64} from './base64';

const test = (source: Array<number>, expected: string): void => {
    ava(`${source.map((x) => `${x}`.padStart(2, '0')).join('-')} -> ${expected}`, (t) => {
        const input = new Uint8Array(source);
        t.is(Base64.encode(input.buffer), expected);
        t.deepEqual(new Uint8Array(Base64.decode(expected)), input);
    });
};

test([], '');
test([0], 'AA==');
test([0, 1], 'AAE=');
test([0, 1, 2], 'AAEC');
