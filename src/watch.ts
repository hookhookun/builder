import * as path from 'path';
import * as rollup from 'rollup';
import {startServer} from './server';
import {FileChecker} from './server/FileChecker';
import {relativeURL} from './util/relativeURL';

export const watch = async (
    inputOptions: rollup.InputOptions,
    outputOptions: rollup.OutputOptions & {dir: string},
): Promise<void> => {
    const watcher = rollup.watch([{...inputOptions, output: outputOptions}]);
    await new Promise((resolve) => {
        const onEvent = (event: rollup.RollupWatcherEvent): void => {
            console.log(event.code);
            if (event.code === 'ERROR') {
                console.error(event.error);
            } else if (event.code === 'END') {
                watcher.removeListener('event', onEvent);
                resolve();
            }
        };
        watcher.on('event', onEvent);
    });
    const fileChecker = new FileChecker();
    const [{clientList}] = await Promise.all([
        startServer(outputOptions.dir),
        fileChecker.checkDirectory(outputOptions.dir),
    ]);
    watcher.on('event', (event) => {
        console.log(event.code);
        if (event.code === 'ERROR') {
            console.error(event.error);
        } else if (event.code === 'END') {
            fileChecker.checkDirectory(outputOptions.dir)
            .then((list) => {
                for (const [file, state] of list) {
                    console.log(`${state}: ${file}`);
                    clientList.broadcast(
                        `event: ${state}\n`,
                        `data: ${relativeURL(path.relative(outputOptions.dir, file))}\n\n`,
                    );
                }
            })
            .catch((error: Error) => console.error(error));
        }
    });
};
