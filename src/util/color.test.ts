import ava from 'ava';
import {rgbToHex, RGBTuple, hexToRGB, rgbToGrayScale} from './color';

const testRGBToHex = (
    rgb: RGBTuple,
    expected: string,
): void => {
    ava(`${JSON.stringify(rgb)} -> ${JSON.stringify(expected)}`, (t) => {
        t.deepEqual(rgbToHex(rgb), expected);
    });
};
testRGBToHex([0, 0, 0], '#000000');
testRGBToHex([255, 255, 255], '#FFFFFF');

const testHexToRGB = (
    hex: string,
    expected: RGBTuple,
): void => {
    ava(`${JSON.stringify(hex)} -> ${JSON.stringify(expected)}`, (t) => {
        t.deepEqual(hexToRGB(hex), expected);
    });
};
testHexToRGB('#000000', [0, 0, 0]);
testHexToRGB('#FFFFFF', [255, 255, 255]);
testHexToRGB('#ffffff', [255, 255, 255]);

const testRGBToGrayScale = (
    rgb: RGBTuple,
    expected: number,
): void => {
    ava(`${JSON.stringify(rgb)} -> ${JSON.stringify(expected)}`, (t) => {
        t.deepEqual(rgbToGrayScale(rgb), expected);
    });
};
testRGBToGrayScale([0, 0, 0], 0);
testRGBToGrayScale([255, 255, 255], 1);
