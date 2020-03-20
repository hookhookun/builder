import test from 'ava';
import {createCounter} from './createCounter';

test('createCounter', (t) => {
    const count = createCounter();
    t.is(count(), 0);
    t.is(count(), 1);
    t.is(count(), 2);
});

test('createCounter startCount=5', (t) => {
    const count = createCounter(5);
    t.is(count(), 5);
    t.is(count(), 6);
    t.is(count(), 7);
});
