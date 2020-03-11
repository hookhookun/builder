import test from 'ava';
import {createIdentifier} from './createIdentifier';

test('Identifier', (t) => {
    const identifier = createIdentifier();
    t.is(identifier('A'), 1);
    t.is(identifier('A'), 1);
    t.is(identifier('B'), 2);
    t.is(identifier('A'), 1);
    t.is(identifier('B'), 2);
});
