export const clamp = (
    value: number,
    min = -Infinity,
    max = Infinity,
): number => {
    if (min <= value) {
        if (value <= max) {
            return value;
        }
        return max;
    }
    return min;
};
