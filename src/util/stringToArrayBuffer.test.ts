import ava from 'ava';
import {stringToArrayBuffer} from './stringToArrayBuffer';

const test = (
    sources: Parameters<typeof stringToArrayBuffer>,
): void => {
    ava(JSON.stringify(sources), (t) => {
        const arrayBuffer = stringToArrayBuffer(...sources);
        t.true(arrayBuffer instanceof ArrayBuffer);
        t.is(
            String.fromCharCode(...new Uint16Array(arrayBuffer)),
            sources.join(''),
        );
    });
};

test([]);
test(['a']);
test(['ab', 'cd']);
