export const debounce = <Fn extends (...args: Array<any>) => any>(
    fn: Fn,
    duration: number,
): (...args: Parameters<Fn>) => void => {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    return (...args: Parameters<Fn>): void => {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => fn(...args), duration);
    };
};
