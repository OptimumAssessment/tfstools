const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const { execSync } = child_process;


const getRepo = async(axios, name) => {
    const result = await axios.get('/_apis/git/repositories/'+name);
    return result.data;
}

module.exports = async( name ) => {
    const axios = await require('./login')();
    let result;

    const fromName = 'AssessmentPlayer';
    const fromRepo = await getRepo(axios, fromName);
    const targetRepo = await getRepo(axios, name);

    result = await axios.get('/_apis/build/definitions', {
        params: {
            repositoryType: 'TfsGit',
            repositoryId: fromRepo.id,
            includeAllProperties: true,
        },
    }).catch( (e) => {
        console.log(e);
    });

    const original = result.data.value[0];

    const clone = Object.assign({},original);
    clone.name = targetRepo.name;

    Object.assign( clone.repository, {
        "id": targetRepo.id,
        "name": targetRepo.name,
        "url": targetRepo.url,
        "defaultBranch": 'refs/heads/master',
    });
    await axios.post('/_apis/build/definitions', clone).catch( (e) => {
        console.log(e);
    });
    console.log('Pipeline cloned');
}
