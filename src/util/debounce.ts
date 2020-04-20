export interface DebouncedFunction<Fn extends (...args: Array<any>) => any> {
    (...args: Parameters<Fn>): void,
    cancel(): void,
}

export const debounce = <Fn extends (...args: Array<any>) => any>(
    fn: Fn,
    duration: number,
): DebouncedFunction<Fn> => {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    return Object.assign(
        (...args: Parameters<Fn>): void => {
            if (timerId) {
                clearTimeout(timerId);
            }
            timerId = setTimeout(() => fn(...args), duration);
        },
        {
            cancel: () => {
                if (timerId) {
                    clearTimeout(timerId);
                }
            },
        },
    );
};
