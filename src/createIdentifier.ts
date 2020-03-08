export const createIdentifier = () => {
    const dictionary = new Map<string, number>();
    return (key: string) => {
        let renamed = dictionary.get(key);
        if (!renamed) {
            renamed = dictionary.size;
            dictionary.set(key, renamed);
        }
        return renamed;
    };
};
