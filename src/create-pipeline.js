const getRepo = async(axios, name) => (await axios.get('/_apis/git/repositories/'+name)).data;
const getRepoName = require('./get-repo-name');

module.exports = async( name ) => {
    name = await getRepoName(name);
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
    axios.post('/_apis/build/definitions', clone).then( ()=> {
        console.log('Build pipeline succesfully created');
    }).catch( async(e) => {
        if(e.response.data.message.indexOf('already exists') !== -1) {
            //update existing definition
            result = await axios.get('/_apis/build/definitions', {
                params: {
                    repositoryType: 'TfsGit',
                    repositoryId: targetRepo.id,
                    includeAllProperties: true,
                },
            });

            const existing = result.data.value[0];
            clone.id = existing.id;
            clone.revision = existing.revision;
            axios.put('/_apis/build/definitions/'+clone.id, clone).then( ()=> {
                console.log('Build pipeline succesfully updated');
            }).catch( (e) => {
                console.log(e);
            });
        } else {
            console.log(e);
        }
    });
}
module.exports.tip = 'creates or updates corresponding build pipeline to match AssessmentPlayer build pipeline';
