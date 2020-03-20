import ava from 'ava';
import {generateIndentString} from './generateIndentString';

const test = (
    args: Parameters<typeof generateIndentString>,
    expected: ReturnType<typeof generateIndentString>,
): void => {
    ava(`${JSON.stringify(args).slice(1, -1)} -> ${expected}`, (t) => {
        t.is(generateIndentString(...args), expected);
    });
};

test([1], ' ');
test([4], '    ');
test([' '], ' ');
test(['\t'], '\t');
