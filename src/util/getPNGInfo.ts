import {parsePNG, PNGChunkInfo} from './parsePNG';

export interface PNGInfo {
    width: number,
    height: number,
    bitDepth: number,
    colorType: number,
    compressionMethod: number,
    filterMethod: number,
    interlaceMethod: number,
}

export const checkPNGSize = (size: number): number => {
    if (size == 0 || 2147483647 < size) {
        throw new Error(`InvalidSize: ${size}`);
    }
    return size;
};

export const checkPNGBitDepthAndColorType = (
    bitDepth: number,
    colorType: number,
): [number, number] => {
    let allowedBitDepth: Array<number> = [];
    switch (colorType) {
        case 0:
            allowedBitDepth = [1, 2, 4, 8, 16];
            break;
        case 3:
            allowedBitDepth = [1, 2, 4, 8];
            break;
        case 2:
        case 4:
        case 6:
            allowedBitDepth = [8, 16];
            break;
        default:
            throw new Error(`InvalidColorType: ${colorType}`);
    }
    if (allowedBitDepth.includes(bitDepth)) {
        return [bitDepth, colorType];
    }
    throw new Error(`InvalidBitDepth: ${bitDepth} (${allowedBitDepth.join(',')} are allowed for colorType: ${colorType})`);
};

export const getPNGInfo = (buffer: ArrayBuffer): PNGInfo => {
    const {type, dataStart} = parsePNG(buffer).next().value as PNGChunkInfo;
    if (type !== 'IHDR') {
        throw new Error(`InvalidType: ${type}`);
    }
    const view = new DataView(buffer, dataStart);
    const width = checkPNGSize(view.getUint32(0));
    const height = checkPNGSize(view.getUint32(4));
    const [bitDepth, colorType] = checkPNGBitDepthAndColorType(
        view.getUint8(8),
        view.getUint8(9),
    );
    const compressionMethod = view.getUint8(10);
    if (compressionMethod !== 0) {
        throw new Error(`InvalidCompressionMethod: ${compressionMethod}`);
    }
    const filterMethod = view.getUint8(11);
    if (filterMethod !== 0) {
        throw new Error(`InvalidFilterMethod: ${filterMethod}`);
    }
    const interlaceMethod = view.getUint8(12);
    if (!(interlaceMethod === 0 || interlaceMethod === 1)) {
        throw new Error(`InvalidInterlaceMethod: ${interlaceMethod}`);
    }
    return {
        width,
        height,
        bitDepth,
        colorType,
        compressionMethod,
        filterMethod,
        interlaceMethod,
    };
};
