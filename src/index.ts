import {build} from './build';
import {parseCLIArguments} from './parseCLIArguments';

build(parseCLIArguments(process.argv))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
