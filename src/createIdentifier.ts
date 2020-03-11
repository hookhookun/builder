export const createIdentifier = () => {
    const dictionary = new Map<string, number>();
    return (key: string) => {
        let id = dictionary.get(key) || -1;
        if (!(0 <= id)) {
            id = dictionary.size + 1;
            dictionary.set(key, id);
        }
        return id;
    };
};
