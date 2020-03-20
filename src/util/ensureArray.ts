export const ensureArray = <Type>(
    input: Type | Array<Type>,
): Array<Type> => {
    return Array.isArray(input) ? input.slice() : [input];
};
