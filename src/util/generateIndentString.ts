export const generateIndentString = (
    size: string | number,
): string => typeof size === 'string' ? size : ' '.repeat(size);
