const fs = require('fs');
const path = require('path');

const promptly = require('promptly');
const os = require('os');
const axios = require('axios');

module.exports = async() => {
    const dotPath = path.join(os.homedir(), '.tfs-login');

    let login = {};
    if(!fs.existsSync(dotPath)) {
        login.username = await promptly.prompt('TFS user name? (3 letters)');
        login.pat = await promptly.prompt('TFS PAT? (https://tfs.citrus.nl/tfs/Citrus.NET/_details/security/tokens)');

        fs.writeFile(dotPath, JSON.stringify(login), ()=> { });
    } else {
        login = JSON.parse( fs.readFileSync(dotPath) );
    }
    const basicAuth = login.username+':'+login.pat;
    axios.defaults.params = {
        'api-version': '4.0',
    };
    axios.defaults.baseURL = 'https://'+basicAuth+'@tfs.citrus.nl/tfs/Citrus.NET/TeleToets';
    return axios;
}