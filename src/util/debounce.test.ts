import test from 'ava';
import {debounce} from './debounce';

test('debounce', async (t) => {
    const result = await new Promise((resolve) => {
        const fn = debounce((a: string, b: number) => resolve({a, b}), 200);
        fn('aaa', 0);
        fn('bbb', 1);
        fn('ccc', 2);
    });
    t.deepEqual(result, {a: 'ccc', b: 2});
});

test('cancel debounce', async (t) => {
    const result = await new Promise((resolve) => {
        const timerId = setTimeout(() => resolve({a: 'ddd', b: 3}), 300);
        const fn = debounce((a: string, b: number) => {
            resolve({a, b});
            clearTimeout(timerId);
        }, 200);
        fn('aaa', 0);
        fn('bbb', 1);
        fn('ccc', 2);
        fn.cancel();
    });
    t.deepEqual(result, {a: 'ddd', b: 3});
});
