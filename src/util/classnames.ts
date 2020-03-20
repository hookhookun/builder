export const classnames = (
    ...list: Array<string | null | undefined | false>
): string => list
.filter((value) => value && value.trim())
.join(' ');
