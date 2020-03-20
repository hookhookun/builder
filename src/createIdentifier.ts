export interface KeyIdentifier {
    (key: string): number,
}

export const createIdentifier = (): KeyIdentifier => {
    const dictionary = new Map<string, number>();
    return (key: string): number => {
        let id = dictionary.get(key) || -1;
        if (!(0 <= id)) {
            id = dictionary.size + 1;
            dictionary.set(key, id);
        }
        return id;
    };
};
