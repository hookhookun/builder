import * as path from 'path';
import * as rollup from 'rollup';

export const hookunResolve = (
    prefix = '@hookun/',
): rollup.Plugin => ({
    name: 'hookunResolve',
    resolveId(importee): rollup.ResolveIdResult {
        if (importee.startsWith(prefix)) {
            const relativePath = path.join(__dirname, importee.slice(prefix.length));
            try {
                return require.resolve(relativePath);
            } catch (error) {
                // Ignore
            }
        }
        return null;
    },
});
