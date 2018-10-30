#!/usr/bin/env node


const createRepo = require('./src/create-repo');
const updateRepoPolicy = require('./src/update-repo-policy.js');
const createPipeline = require('./src/create-pipeline');


(async() => {
    const commandList = Object.keys(map).join(', ');
    if(process.argv.length < 3) {
        console.error('Invalid usage. Correct usage: tfstools [command]');
        console.error('Use one of: '+commandList);
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
        console.error('Invalid command '+command+'. Use one of: '+commandList);
        process.exit(1);
    }
    func.apply(this,rest).catch( (e) => {
        console.log(e);
        if(e.response) {
            console.log(e.response.data);
        }
        process.exit(1);
    });
})();



