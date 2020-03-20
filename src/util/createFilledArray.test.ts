import ava from 'ava';
import {createFilledArray} from './createFilledArray';

const test = <Type>(
    args: [number, Type],
    expected: Array<Type>,
): void => {
    ava(`${JSON.stringify(args)} -> ${JSON.stringify(expected)}`, (t) => {
        t.deepEqual(createFilledArray(...args), expected);
    });
};

test([0, 1], []);
test([1, 1], [1]);
test([2, 1], [1, 1]);
test([2, null], [null, null]);
