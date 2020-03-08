import * as rollup from 'rollup';

export const sucrase: () => rollup.Plugin;
export const nodeResolve: () => rollup.Plugin;
export const commonjs: () => rollup.Plugin;
export const replace: (developMode: boolean) => rollup.Plugin;
export const terser: () => rollup.Plugin;
