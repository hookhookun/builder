import ava from 'ava';
import {ensureArray} from './ensureArray';

const test = <Type>(
    arg: Type | Array<Type>,
    expected: Array<Type>,
): void => {
    ava(`${JSON.stringify(arg)} -> ${JSON.stringify(expected)}`, (t) => {
        t.deepEqual(ensureArray(arg), expected);
    });
};

test([], []);
test('', ['']);
test([''], ['']);
test(1, [1]);
test([1], [1]);
test(null, [null]);
test([null], [null]);
