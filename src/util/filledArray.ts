export const filledArray = <Type>(
    length: number,
    value: Type,
): Array<Type> => {
    const result: Array<Type> = [];
    for (let index = 0; index < length; index++) {
        result[index] = value;
    }
    return result;
};
