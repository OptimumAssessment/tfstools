const child_process = require('child_process');
const path = require('path');
const { execSync } = child_process;

const assert = require('assert');
const which = require('which');
const demoUrl = require('./demo-url');

module.exports = async() => {
    const axios = await require('./login')();
    const repo = process.cwd().split(path.sep).pop();

    let result;
    result = await axios.get('/_apis/git/repositories/'+repo);
    const repositoryId = result.data.id;
    assert(repositoryId.match(/^[a-z0-9-]+$/));

    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

    console.log('Creating pull request for:', repo);
    console.log('Branch:', branch );
    assert(branch != 'master');


    const title = 'Merge '+branch+' to master';
    let description = title;

    if(process.argv.indexOf('demo') !== -1) {
        let gitVersionLocation = which.sync('gitversion');
        const semver = JSON.parse(
            child_process.spawnSync(gitVersionLocation).stdout
        ).FullSemVer;
        description = 'Demo at: ' + demoUrl(repo, semver);
    }

    const workItemId = branch.match(/[0-9]+/)[0];
    const workItemUrl = (await axios.get('_apis/wit/workitems?ids='+workItemId)).data.value[0].url;
    const workItem = { id:workItemId, url:workItemUrl };

    result = await axios.post('/_apis/git/repositories/'+repositoryId+'/pullrequests', {
        sourceRefName:'refs/heads/'+branch,
        targetRefName:'refs/heads/master',
        title,
        description,
        reviewers: [
            {
                id: '98402fb7-28d3-4c35-8dcf-61124d96ec2b',
            }
        ],
        workItemRefs: [ workItem ],
    }).catch( (e) => {
        console.log(e.response.data);
    });
    console.log(result.data);
}


