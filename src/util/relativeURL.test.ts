import ava from 'ava';
import {relativeURL} from './relativeURL';

const test = (
    args: Parameters<typeof relativeURL>,
    expected: ReturnType<typeof relativeURL>,
): void => {
    ava(`${JSON.stringify(args).slice(1, -1)} -> ${expected}`, (t) => {
        t.is(relativeURL(...args), expected);
    });
};

test([], '.');
test(['.'], '.');
test(['a'], './a');
test(['a/'], './a/');
test(['a', 'b'], './a/b');
test(['a/', 'b'], './a/b');
test(['a/', '/b'], './a/b');
test(['a/', './b'], './a/b');
test(['a/', 'b/'], './a/b/');
test(['a/', '/b/'], './a/b/');
test(['a', '.', 'b'], './a/b');
test(['a', '..', 'b'], './b');
test(['a', '..', 'b', '..'], '.');
test(['a', '..', '..', 'b'], '../b');
