import ava from 'ava';
import {filledArray} from './filledArray';

const test = <Value>(
    length: number,
    value: Value,
    expected: Array<Value>,
): void => {
    ava(`${length} ${value}`, (t) => {
        t.deepEqual(filledArray(length, value), expected);
    });
};

test(5, 'a', ['a', 'a', 'a', 'a', 'a']);
