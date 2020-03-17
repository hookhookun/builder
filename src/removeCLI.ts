#!/usr/bin/env node
import {remove} from './remove';
import {absolute} from './absolute';

const cwd = process.cwd();

Promise.all(process.argv.slice(2).map(async (file) => {
    const filePath = absolute(file, cwd);
    await remove(filePath);
}))
