export interface Counter {
    (): number,
}

export const createCounter = (
    startCount = 0,
): Counter => {
    let count = startCount;
    return (): number => count++;
};
