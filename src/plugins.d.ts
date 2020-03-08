import * as rollup from 'rollup';

export const sucrase: () => rollup.Plugin;
export const nodeResolve: () => rollup.Plugin;
export const commonjs: () => rollup.Plugin;
export const replace: (replacements?: {[pattern: string]: string}) => rollup.Plugin;
export const terser: () => rollup.Plugin;
