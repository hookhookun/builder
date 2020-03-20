export const createFilledArray = <Item>(
    length: number,
    value: Item,
): Array<Item> => {
    const array: Array<Item> = [];
    for (let index = 0; index < length; index++) {
        array[index] = value;
    }
    return array;
};
