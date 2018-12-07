const fs = require('fs');
const child_process = require('child_process');
const login = require('./login');

const getRepoName = require('get-repo-name');
const { execSync } = child_process;

module.exports = async( name ) => {
    if(!fs.existsSync('.git')) {
        throw Error('Use in git repo or specify name: tfstools repo [name]');
    }
    const gitStatus = execSync('git status').toString().trim();
    if(!gitStatus.match(/^On branch master\s/m)) {
        throw Error('Please switch to master branch first!');
    }
    if(gitStatus.match(/^No commits yet$/m)) {
        throw Error('Please make an initial commit first');
    }
    name = getRepoName(name);

    const axios = await login();
    result = await axios.post('/_apis/git/repositories', { name });

    execSync('git remote add origin ' + result.data.remoteUrl);
    execSync('git push --set-upstream origin master');
    console.log("Git repository succesfully created');
}
