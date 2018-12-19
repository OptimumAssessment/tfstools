const { execSync } = require('child_process');
module.exports = async() => {
    try {
        execSync(`GIT_SEQUENCE_EDITOR='node ${__dirname}/unsyncvars-rebase.js' git rebase -i syncvars^`);
        execSync(`git tag -d syncvars`);
    } catch(e) {
        console.error('unsyncvars failed: ',e);
    }
}
module.exports.tip = 'undo a previous synvars command';
