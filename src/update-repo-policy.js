const assert = require('assert');
module.exports = async( name ) => {
    assert( name !== undefined );

    const axios = await require('./login')();
    let result;

    const fromRepoName = 'Optimum.Documentation';
    result = await axios.get(`/_apis/git/repositories/${fromRepoName}`)

    const fromRepoId = result.data.id;
    result = await axios.get('/_apis/git/repositories/'+name);
    const repoId = result.data.id;

    result = await axios.get('/_apis/policy/configurations');

    const all = result.data.value.filter(v => v.settings.scope[0].repositoryId === fromRepoId );
    for await (const config of all) {
        config.settings.scope[0].repositoryId = repoId;
        await axios.post('/_apis/policy/configurations', config);
    }
    console.log("Policies have been set correctly");
}


