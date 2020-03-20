import ava from 'ava';
import {classnames} from './classnames';

const test = (
    args: Parameters<typeof classnames>,
    expected: ReturnType<typeof classnames>,
): void => {
    ava(`${JSON.stringify(args)} -> ${JSON.stringify(expected)}`, (t) => {
        t.deepEqual(classnames(...args), expected);
    });
};

test([], '');
test(['a', 'b'], 'a b');
test(['a', false, null, undefined, 'b'], 'a b');
