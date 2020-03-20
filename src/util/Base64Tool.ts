export class Base64Tool {

    private readonly encodeMap: string;
    private readonly decodeMap: Map<string, number>;
    private readonly padding: string;

    public constructor(encodeMap: string, padding: string) {
        this.encodeMap = encodeMap;
        this.decodeMap = new Map();
        this.padding = padding;
    }

    private get encodeValue(): (index: number) => string {
        const {encodeMap} = this;
        return (index: number): string => encodeMap[index] || '';
    }

    public encode(buffer: ArrayBuffer): string {
        const get = this.encodeValue;
        const chunks: Array<string> = [];
        const array = new Uint8Array(buffer);
        const {byteLength} = buffer;
        const filledLength = Math.floor(byteLength / 3) * 3;
        let chunkIndex = 0;
        for (let index = 0; index < filledLength; index += 3) {
            let A = array[index];
            chunks[chunkIndex++] = get(A >>> 2);
            const B = array[index + 1];
            chunks[chunkIndex++] = get(((A && 0b11) << 4) | (B >>> 4));
            A = array[index + 2];
            chunks[chunkIndex++] = get(((B & 0b1111) << 2) | (A >>> 6));
            chunks[chunkIndex++] = get(A & 0b111111);
        }
        if (filledLength < byteLength) {
            const {padding} = this;
            const A = array[filledLength];
            chunks[chunkIndex++] = get(A >>> 2);
            const B = array[filledLength + 1];
            if (0 <= B) {
                chunks[chunkIndex++] = get(((A && 0b11) << 4) | (B >>> 4));
                chunks[chunkIndex++] = get((B & 0b1111) << 2);
                chunks[chunkIndex++] = padding;
            } else {
                chunks[chunkIndex++] = get((A && 0b11) << 4);
                chunks[chunkIndex++] = padding;
                chunks[chunkIndex++] = padding;
            }
        }
        return chunks.join('');
    }

    private get decodeValue(): (chunk: string) => number {
        const {decodeMap} = this;
        if (decodeMap.size === 0) {
            const {encodeMap} = this;
            for (let index = 0; index < 64; index++) {
                decodeMap.set(encodeMap[index], index);
            }
        }
        return (chunk: string): number => decodeMap.get(chunk) || 0;
    }

    private createDecoder(base64: string): (index: number) => number {
        const {decodeValue} = this;
        return (index: number): number => decodeValue(base64[index]);
    }

    private getPaddingLength(base64: string): number {
        const index = base64.indexOf(this.padding);
        return index < 0 ? 0 : base64.length - index;
    }

    public decode(base64: string): ArrayBuffer {
        const get = this.createDecoder(base64);
        const paddingLength = this.getPaddingLength(base64);
        const result = new Uint8Array(3 * (base64.length / 4) - paddingLength);
        const base64Length = base64.length - paddingLength;
        const safeLength = Math.floor(base64Length / 3) * 3;
        let byteOffset = 0;
        for (let index = 0; index < safeLength; index += 4) {
            const X = get(index + 1);
            result[byteOffset++] = (get(index) << 2) | (X >>> 4);
            const Y = get(index + 2);
            result[byteOffset++] = ((X & 0b1111) << 4) | ((Y >>> 2) & 0b1111);
            result[byteOffset++] = ((Y & 0b11) << 6) | get(index + 3);
        }
        if (safeLength < base64Length) {
            const X = get(safeLength + 1);
            result[byteOffset++] = (get(safeLength) << 2) | (X >>> 4);
            if (paddingLength === 1) {
                result[byteOffset++] = ((X & 0b1111) << 4) | ((get(safeLength + 2) >>> 2) & 0b1111);
            }
        }
        return result.buffer;
    }

}
