#!/usr/bin/env node

const chalk = require('chalk');
(async() => {
    const map = {
        'setup': require('./src/setup'),
        'repo': require('./src/create-repo'),
        'policy': require('./src/update-repo-policy.js'),
        'pipeline': require('./src/create-pipeline'),
        'pr': require('./src/create-pull-request.js'),
        'prs': require('./src/pull-requests.js'),
    }
    const commandList = Object.keys(map).join(', ');
    if(process.argv.length < 3) {
        renderHelp(map);
        process.exit(1);
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


function renderHelp(map) {
    const perCommandHelp = [];
    for(var i in map) {
        perCommandHelp.push( "    " + chalk.green('tfstools '+i).padEnd(30) + map[i].tip);
    }
console.log(`
    tfstools connects to the TFS REST api, to give you some helpful commands.
    Commands expect to be run in a local git repository.

${perCommandHelp.join("\n")}

`);
}
