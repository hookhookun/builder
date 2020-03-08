exports.sucrase = () => require('@rollup/plugin-sucrase')({
    exclude: ['node_modules/**'],
    transforms: ['typescript'],
});
exports.nodeResolve = () => require('@rollup/plugin-node-resolve')({
    extensions: ['.js', '.ts'],
});
exports.commonjs = () => {
    const namedExports = {};
    try {
        namedExports[require.resolve('react')] = Object.keys(require('react'));
    } catch {}
    try {
        namedExports[require.resolve('react-dom')] = Object.keys(require('react-dom'));
    } catch {}
    try {
        namedExports[require.resolve('react-is')] = Object.keys(require('react-is'));
    } catch {}
    return require('@rollup/plugin-commonjs')({namedExports});
};
exports.replace = (replacements = {}) => require('@rollup/plugin-replace')(replacements);
exports.terser = () => require('rollup-plugin-terser').terser();
