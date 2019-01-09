const fs = require('fs');
const path = require('path');

const promptly = require('promptly');
const os = require('os');
const axios = require('axios');

const ask = async(question, prefill, secret = false) => {
    if(prefill) {
        let show = prefill;
        if(secret) {
            show = prefill.substr(0,5)+'...'+prefill.substr(prefill.length-5);
        }
        question += ' (ENTER for '+show+')';
    }
    return await promptly.prompt(question, { default:prefill });
}
module.exports = async() => {
    const dotPath = path.join(os.homedir(), '.tfs-login');

    let setup;
    if(fs.existsSync(dotPath)) {
        setup = JSON.parse( fs.readFileSync(dotPath) );
    } else {
        setup = {
        }
    }
    setup.tfsurl = await ask('TFS url?', setup.tfsurl);
    setup.username = await ask('TFS user name?', setup.username);

    console.log('For your Personal Access Token (PAT), please navigate to the security page under your profile in TFS');
    setup.pat = await ask('TFS PAT?', setup.pat, true);

    fs.writeFileSync(dotPath, JSON.stringify(setup));
    console.log('setup complete');
}
