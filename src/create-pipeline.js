const getRepo = async(axios, name) => {
    const result = await axios.get('/_apis/git/repositories/'+name).catch((e) => {
        console.error(`Unable to get repository ${name} from TFS`);
        console.log(e.response.data);
        process.exit(1);
    });
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
        console.error('Unable to get correct build pipeline from TFS');
        console.log(e.response.data);
        process.exit(1);
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
        console.error('Failed to create build pipeline');
        console.log(e.response.data);
        process.exit(1);
    });
    console.log('Build pipeline succesfully created');
}
