const fs = require('fs');
const path = require('path');

const promptly = require('promptly');
const os = require('os');
const axios = require('axios');

module.exports = async() => {
    const dotPath = path.join(os.homedir(), '.tfs-login');

    let setup;
    if(fs.existsSync(dotPath)) {
        setup = JSON.parse( fs.readFileSync(dotPath) );
    } else {
        setup = {
            tfsurl:'',
            username:'',
            pat:'',
        }
    }
    setup.tfsurl = await promptly.prompt('TFS url?', setup.tfsurl);
    setup.username = await promptly.prompt('TFS user name? (3 letters)', setup.username);
    setup.pat = await promptly.prompt('TFS PAT? (In TFS, navigate to security at the profile menu)', setup.pat);

    fs.writeFileSync(dotPath, JSON.stringify(setup));
    console.log('setup complete');
}
