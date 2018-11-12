const child_process = require('child_process');
const path = require('path');
const { execSync } = child_process;

const assert = require('assert');
const which = require('which');

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
        const versionResult = child_process.spawnSync(gitVersionLocation);
        const semver = JSON.parse(versionResult.stdout).FullSemVer;
        const prefix = 'https://cafe.citrusandriessen.nl/#';
        const url = [ prefix, repo, 'v'+semver ].join('/');
        description = 'Demo at: ' + url;
    }

    result = await axios.post('/_apis/git/repositories/'+repositoryId+'/pullrequests', {
        sourceRefName:'refs/heads/'+branch,
        targetRefName:'refs/heads/master',
        title,
        description,
        reviewers: [
            {
                id: '98402fb7-28d3-4c35-8dcf-61124d96ec2b',
            }
        ]
    }).catch( (e) => {
        console.log(e.response.data);
    });
    console.log(result.data);
}


