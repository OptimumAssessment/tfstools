const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const { execSync } = child_process;


module.exports = async( name ) => {
    const axios = await require('./login')();
    let result;
    result = await axios.get('/_apis/policy/types');
    const policies = result.data.value;

    result = await axios.get('/_apis/git/repositories/Teletoets.Documentation');
    const fromRepoId = result.data.id;

    result = await axios.get('/_apis/git/repositories/'+name);
    const repoId = result.data.id;

    result = await axios.get('/_apis/policy/configurations');

    const all = result.data.value.filter(v => v.settings.scope[0].repositoryId === fromRepoId );
    all.forEach( (config) => {
        config.settings.scope[0].repositoryId = repoId;
        axios.post('/_apis/policy/configurations', config).catch( (e) => {
            console.log(e.response);
        });
    });
}


