#!/usr/bin/env node


const createRepo = require('./src/create-repo');
const updateRepoPolicy = require('./src/update-repo-policy.js');
const createPipeline = require('./src/create-pipeline');


(async() => {

    if(process.argv.length < 3) {
        console.error('Invalid usage. Correct usage: tfstools [command]');
        process.exit(1);
    }
    const [ , , command, ...rest ] = process.argv;
    const map = {
        'repo': createRepo,
        'policy': updateRepoPolicy,
        'pipeline': createPipeline,
    }
    const func = map[command];
    if(!func) {
        const commandList = Object.keys(map).join(', ');
        console.error('Invalid command '+command+'. Use one of: '+commandList);
        process.exit(1);
    }
    func.apply(this,rest);
})();



