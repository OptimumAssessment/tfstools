module.exports = async( name ) => {
    const axios = await require('./login')();
    let result;

    const fromRepoName = 'Teletoets.Documentation';
    result = await axios.get(`/_apis/git/repositories/${fromRepoName}`).catch( (e) => {
        console.error(`Error while getting repository to copy policies from: ${fromRepoName}`)
        console.log(e.response.data);
        process.exit(1);
    });
    const fromRepoId = result.data.id;

    result = await axios.get('/_apis/git/repositories/'+name).catch( (e) => {
        console.error(`Error while getting repository: ${name}`)
        console.log(e.response.data);
        process.exit(1);
    });
    const repoId = result.data.id;

    result = await axios.get('/_apis/policy/configurations').catch( (e) => {
        console.error(`Error while getting current policy configurations of: ${name}`)
        console.log(e.response.data);
        process.exit(1);
    });

    const all = result.data.value.filter(v => v.settings.scope[0].repositoryId === fromRepoId );
    for await (const config of all) {
        config.settings.scope[0].repositoryId = repoId;
        await axios.post('/_apis/policy/configurations', config).catch( (e) => {
            console.error('Error while setting new policy configuration')
            console.log(e.response.data);
            process.exit(1);
        });
    }
    
    console.log("Policies have been set correctly");
}


