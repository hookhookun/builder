const {prototype: {toString}} = Object;
export const typeOf = (input: any): string => toString.call(input).slice(8, -1);
