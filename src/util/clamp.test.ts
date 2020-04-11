import ava from 'ava';
import {clamp} from './clamp';

const test = (
    value: number,
    expected: number,
    min?: number,
    max?: number,
): void => {
    const title = [value];
    if (typeof min === 'number') {
        title.push(min);
    }
    if (typeof max === 'number') {
        title.push(max);
    }
    ava(`${title.join(', ')} -> ${expected}`, (t) => {
        t.is(clamp(value, min, max), expected);
    });
};

test(0, 0);
test(1, 1);
test(-3, 1, 1, 2);
test(3, 2, 1, 2);
