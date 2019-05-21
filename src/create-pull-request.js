const child_process = require('child_process');
const path = require('path');
const { execSync } = child_process;

const assert = require('assert');
const which = require('which');

const reviewers = [
    'eb42e8e4-110e-46c4-96a5-64d3fb3b9727', //mike
    'f995a367-b97b-4033-880d-127fc8bdbd0f', //jorrit verstijlen
    '4ba998fe-07fb-4697-8e41-fc8575b6cc07', //roeland
].map(id => ({id}));

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
    if(process.argv.length > 3) {
        description = process.argv[3];
    }

    let workItemRefs = [];

    try {
        const workItemId = branch.match(/[0-9]+/)[0];
        const workItemUrl = (await axios.get('/_apis/wit/workitems?ids='+workItemId)).data.value[0].url;
        const workItem = { id:workItemId, url:workItemUrl };
        workItemRefs.push(workItem);
    } catch(e) {
        //no linked work item
        console.log(e);
    }
    result = await axios.post('/_apis/git/repositories/'+repositoryId+'/pullrequests', {
        sourceRefName:'refs/heads/'+branch,
        targetRefName:'refs/heads/master',
        title,
        description,
        completionOptions: {
            deleteSourceBranch: true,
            transitionWorkItems: true,
        },
        workItemRefs,
    }).catch( (e) => {
        console.log(e.response.data);
    });
    console.log(result.data);
}

module.exports.tip = 'creates a pull request for the current branch. (add "demo" to include component library link)';
