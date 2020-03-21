export type RGBTuple = [number, number, number];

export const rgbToHex = (
    rgb: RGBTuple,
): string => [
    '#',
    ...rgb.map((value) => value.toString(16).toUpperCase().padStart(2, '0')),
].join('');

export const hexToRGB = (
    hex: string,
): RGBTuple => [1, 3, 5]
.map((index) => parseInt(hex.slice(index, index + 2), 16)) as RGBTuple;

export const BT601: RGBTuple = [0.299, 0.587, 0.114];
export const rgbToGrayScale = (
    rgb: RGBTuple,
    coefficients = BT601,
): number => rgb.reduce((sum, x, index) => sum + x * coefficients[index], 0) / 255;
