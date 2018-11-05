const getRepo = async(axios, name) => (await axios.get('/_apis/git/repositories/'+name)).data;
const assert = require('assert');

module.exports = async( name ) => {
    assert( name !== undefined );
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
    await axios.post('/_apis/build/definitions', clone);
    console.log('Build pipeline succesfully created');
}
