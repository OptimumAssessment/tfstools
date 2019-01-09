const fs = require('fs');
const path = require('path');

const promptly = require('promptly');
const os = require('os');
const axios = require('axios');

module.exports = async(force) => {
    const dotPath = path.join(os.homedir(), '.tfs-login');

    let login = {};
    if(force || !fs.existsSync(dotPath)) {
        login.username = await promptly.prompt('TFS user name? (3 letters)');
        login.pat = await promptly.prompt('TFS PAT? (In TFS, navigate to security at the profile menu)');

        fs.writeFile(dotPath, JSON.stringify(login), ()=> { });
    } else {
        login = JSON.parse( fs.readFileSync(dotPath) );
    }
    const basicAuth = login.username+':'+login.pat;
    axios.defaults.params = {
        'api-version': '4.0',
    };
    axios.defaults.baseURL = 'https://'+basicAuth+'@tfs.citrus.nl/tfs/Citrus.NET/Optimum';
    return axios;
}
