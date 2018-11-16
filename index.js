#!/usr/bin/env node



(async() => {
    const map = {
        'repo': require('./src/create-repo'),
        'policy': require('./src/update-repo-policy.js'),
        'pipeline': require('./src/create-pipeline'),
        'pr': require('./src/create-pull-request.js'),
        'syncvars': require('./src/syncvars'),
        'unsyncvars': require('./src/unsyncvars'),
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


