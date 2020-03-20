export const relativeURL = (
    ...fragments: Array<string>
): string => {
    const parts: Array<string> = [];
    for (const fragment of fragments) {
        for (const part of fragment.split(/\//)) {
            switch (part) {
                case '':
                case '.':
                    break;
                case '..': {
                    const lastPart = parts.pop();
                    if (lastPart) {
                        if (lastPart === part) {
                            parts.push(lastPart, part);
                        }
                    } else {
                        parts.push(part);
                    }
                    break;
                }
                default:
                    parts.push(part);
            }
        }
    }
    if (0 < parts.length) {
        const endsWithDelimiter = /[\\/]$/.test(fragments[fragments.length - 1]);
        if (endsWithDelimiter) {
            parts.push('');
        }
        if (parts[0] !== '..') {
            parts.unshift('.')
        }
        return parts.join('/');
    }
    return '.';
};
