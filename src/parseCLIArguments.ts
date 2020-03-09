import * as path from 'path';
import {BuildOptions} from './build';
import {absolute} from './absolute';

export const parseCLIArguments = (
    cliArgumentList: Array<string>,
): BuildOptions => {
    const options: Partial<BuildOptions> = {};
    const cwd = process.cwd();
    for (let index = 0; index < cliArgumentList.length; index++) {
        switch (cliArgumentList[index]) {
            case '--watch':
                options.watch = true;
                break;
            case '--src':
                options.src = absolute(cliArgumentList[++index], cwd);
                break;
            case '--dest':
                options.dest = absolute(cliArgumentList[++index], cwd);
                break;
            case '--debug':
                options.debug = true;
                break;
            default:
        }
    }
    return {
        src: options.src || path.join(cwd, 'src'),
        dest: options.dest || path.join(cwd, 'dest'),
        watch: options.watch || false,
        debug: options.debug,
    };
};
