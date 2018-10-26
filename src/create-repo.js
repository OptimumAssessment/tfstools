const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const { execSync } = child_process;


module.exports = async( name ) => {
    const axios = await require('./login')();
    let localRepoExists; 
    if(name === undefined) {
        //check if this is agit repo
        if(!fs.existsSync('.git')) {
            console.error('Use in git repo or specify name: tfstools repo [name]');
            process.exit(1);
        }

        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        if(currentBranch !== 'master') {
            console.log('No repo name given, can use current repo but please switch to master branch first!');
            process.exit(1);
        }
        name = process.cwd().split('/').pop();
        localRepoExists = true;
    } else {
        localRepoExists = false;
    }
    result = await axios.post('/_apis/git/repositories', {
        name,
    }).catch( (e) => {
        console.log(e);
    });


    if(localRepoExists) {
        execSync('git remote add origin ' + result.data.remoteUrl);
        execSync('git commit --allow-empty -m "initial commit"');
        execSync('git push --set-upstream origin master');
    } else {
        const gitdir = path.join( process.cwd(), name)
        execSync('git clone ' + result.data.remoteUrl);
        execSync('git commit --allow-empty -m "initial commit"', { cwd:gitdir });
        execSync('git push', { cwd:gitdir });
    }
}