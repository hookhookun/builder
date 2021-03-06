import * as path from 'path';

export const absolute = (
    relativeOrAbsolutePath: string,
    baseDirectory: string,
): string => {
    if (path.isAbsolute(relativeOrAbsolutePath)) {
        return relativeOrAbsolutePath;
    }
    return path.join(baseDirectory, relativeOrAbsolutePath);
};
