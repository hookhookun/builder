export const createArray = <Item>(
    length: number,
    valueGenerator: (index: number) => Item,
): Array<Item> => {
    const array: Array<Item> = [];
    for (let index = 0; index < length; index++) {
        array[index] = valueGenerator(index);
    }
    return array;
};
