const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const { execSync } = child_process;


module.exports = async( name ) => {
    const axios = await require('./login')();
    let localRepoExists; 
    let needsInitialCommit; 
    if(name === undefined) {
        //check if this is a git repo
        if(!fs.existsSync('.git')) {
            throw Error('Use in git repo or specify name: tfstools repo [name]');
        }


        const gitStatus = execSync('git status').toString().trim();
        if(!gitStatus.match(/^On branch master\s/m)) {
            throw Error('No repo name given, can use current repo but please switch to master branch first!');
        }
        if(gitStatus.match(/^No commits yet$/m)) {
            needsInitialCommit = true;
        }

        name = process.cwd().split('/').pop();
        localRepoExists = true;
    } else {
        localRepoExists = false;
    }
    result = await axios.post('/_apis/git/repositories', {
        name,
    });


    if(localRepoExists) {
        execSync('git remote add origin ' + result.data.remoteUrl);
        if(needsInitialCommit) {
            execSync('git commit --allow-empty -m "initial commit"');
        }
        execSync('git push --set-upstream origin master');
    } else {
        const gitdir = path.join( process.cwd(), name)
        execSync('git clone ' + result.data.remoteUrl);
        execSync('git commit --allow-empty -m "initial commit"', { cwd:gitdir });
        execSync('git push', { cwd:gitdir });
    }
    console.log("Git repository succesfully created");
}
