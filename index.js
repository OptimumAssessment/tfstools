#!/usr/bin/env node


const createRepo = require('./src/create-repo');
const updateRepoPolicy = require('./src/update-repo-policy.js');
const createPipeline = require('./src/create-pipeline');


(async() => {

    if(process.argv.length < 3) {
        throw new Error('Usage: tfstools [command]');
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
        throw new Error('Invalid command '+command+'. Use one of: '+commandList);
    }
    func.apply(this,rest);
})();



