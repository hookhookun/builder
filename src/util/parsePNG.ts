export interface PNGChunkInfo {
    type: string,
    start: number,
    end: number,
    dataStart: number,
    dataEnd: number,
    dataLength: number,
    crc: number,
}

export const checkPNGHeader = (view: DataView): boolean => [
    0x89,
    0x50,
    0x4E,
    0x47,
    0x0D,
    0x0A,
    0x1A,
    0x0A,
].every((expected, index) => view.getUint8(index) === expected);

export const getPNGChunk = (
    view: DataView,
    start: number,
): PNGChunkInfo => {
    const dataLength = view.getUint32(start, false);
    const type = String.fromCodePoint(
        view.getUint8(start + 4),
        view.getUint8(start + 5),
        view.getUint8(start + 6),
        view.getUint8(start + 7),
    );
    const dataStart = start + 8;
    const dataEnd = dataStart + dataLength;
    const crc = view.getUint32(dataEnd);
    const end = dataEnd + 4;
    return {start, end, dataStart, dataEnd, dataLength, type, crc};
};

export const parsePNG = function* (
    buffer: ArrayBuffer,
): Generator<PNGChunkInfo> {
    const view = new DataView(buffer);
    if (!checkPNGHeader(view)) {
        throw new Error('InvalidSignature');
    }
    const {byteLength} = view;
    let offset = 8;
    while (offset < byteLength) {
        const chunk = getPNGChunk(view, offset);
        yield chunk;
        if (chunk.type === 'IEND') {
            return;
        }
        offset = chunk.end;
    }
};
