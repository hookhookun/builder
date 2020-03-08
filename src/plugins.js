exports.sucrase = () => require('@rollup/plugin-sucrase')({
    exclude: ['node_modules/**'],
    transforms: ['typescript'],
});
exports.nodeResolve = () => require('@rollup/plugin-node-resolve')({
    extensions: ['.js', '.ts'],
});
exports.commonjs = () => require('@rollup/plugin-commonjs')({
    namedExports: {
        [require.resolve('react')]: Object.keys(require('react')),
        [require.resolve('react-dom')]: Object.keys(require('react-dom')),
        [require.resolve('react-is')]: Object.keys(require('react-is')),
    },
});
exports.replace = (developMode) => require('@rollup/plugin-replace')({
    'process.env.NODE_ENV': developMode ? '\'\'' : '\'production\'',
});
exports.terser = () => require('rollup-plugin-terser').terser();
