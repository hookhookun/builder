import ava from 'ava';
import {createArray} from './createArray';

const test = <Type>(
    args: [number, (index: number) => Type],
    expected: Array<Type>,
): void => {
    ava(`${JSON.stringify(args)} -> ${JSON.stringify(expected)}`, (t) => {
        t.deepEqual(createArray(...args), expected);
    });
};

test([0, (index): number => index * 2], []);
test([1, (index): number => index * 2], [0]);
test([2, (index): number => index * 2], [0, 2]);
