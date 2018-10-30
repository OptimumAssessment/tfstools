#!/usr/bin/env node


const createRepo = require('./src/create-repo');
const updateRepoPolicy = require('./src/update-repo-policy.js');
const createPipeline = require('./src/create-pipeline');


(async() => {
    const map = {
        'repo': createRepo,
        'policy': updateRepoPolicy,
        'pipeline': createPipeline,
    }
    const commandList = Object.keys(map).join(', ');
    if(process.argv.length < 3) {
        throw Error('Invalid usage. Correct usage: tfstools [command]'+"\n"+'Use one of: '+commandList);
    }
    const [ , , command, ...rest ] = process.argv;
    const func = map[command];
    if(!func) {
        throw Error('Invalid command '+command+'. Use one of: '+commandList);
    }
    return func.apply(this,rest);
})().catch( (e) => {
    console.log(e);
    if(e.response) {
        console.log(e.response.data);
    }
    process.exit(1);
});


