export const cheerioElementToString = (element: CheerioElement): string => {
    if (element.type === 'text') {
        return element.data || '';
    }
    return (element.childNodes || []).map(cheerioElementToString).join('');
};
