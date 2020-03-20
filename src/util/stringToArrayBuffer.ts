export const stringToArrayBuffer = (
    ...sourceList: Array<string>
): ArrayBuffer => {
    const arrayLength = sourceList.reduce((sum, source) => sum + source.length, 0);
    const array = new Uint16Array(arrayLength);
    let offset = 0;
    for (const source of sourceList) {
        const {length} = source;
        for (let index = 0; index < length; index++) {
            array[offset++] = source.charCodeAt(index);
        }
    }
    return array.buffer;
};
