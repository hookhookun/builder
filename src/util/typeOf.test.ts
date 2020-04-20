import ava from 'ava';
import {typeOf} from './typeOf';

const test = (
    input: Parameters<typeof typeOf>[0],
    expected: string,
): void => {
    ava(`${JSON.stringify(input)} -> ${expected}`, (t) => {
        t.is(typeOf(input), expected);
    });
};

test(null, 'Null');
test(undefined, 'Undefined');
test(0, 'Number');
test('', 'String');
test([], 'Array');
test({}, 'Object');
test(new Map(), 'Map');
test(new Set(), 'Set');
test(typeOf, 'Function');
