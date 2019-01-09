const fs = require('fs');
const path = require('path');

const promptly = require('promptly');
const os = require('os');
const axios = require('axios');

module.exports = async() => {
    const dotPath = path.join(os.homedir(), '.tfs-login');
    let settings;
    try {
        settings = JSON.parse( fs.readFileSync(dotPath) );
        if(!settings.tfsurl) {
            throw new Error('no.tfsurl');
        }
    } catch(e) {
        console.log(`please run 'tfstools setup' first`);
        process.exit(1);
    }

    const { username, pat, tfsurl } = settings;
    const basicAuth = username+':'+pat;
    axios.defaults.params = {
        'api-version': '4.0',
    };
    axios.defaults.baseURL = tfsurl.replace('//', '//'+basicAuth+'@');
    return axios;
}
