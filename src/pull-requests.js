const open = require('open');
module.exports = async() => {
    const axios = await require('./login')();

    const list = (await axios.get('/_apis/git/pullrequests')).data.value;
    if (list.length === 0) {
        console.log('No open pull requests.');
        process.exit(0);
    }

    list.forEach((pr,i) => {
        const values = [
            (i+1)+'. '+pr.createdBy.displayName,
            pr.title,
        ];
        console.log(values.join('\n'));
        console.log('');
    });

    const readline = require('readline');

    // Allows us to listen for events from stdin
    readline.emitKeypressEvents(process.stdin);

    // Raw mode gets rid of standard keypress events and other
    // functionality Node.js adds by default
    process.stdin.setRawMode(true);


    // Start the keypress listener for the process
    process.stdin.on('keypress', (str, key) => {

        // "Raw" mode so we must do our own kill switch
        if(key.sequence === '\u0003') {
            process.exit();
        }
        const idx = parseInt(str)-1;
        const pr = list[idx];
        const url = [
			'https://tfs.citrus.nl/tfs/Citrus.NET/The%20product%20backlog/_git',
            pr.repository.name,
            'pullrequest',
            pr.pullRequestId,
            '?_a=files',
        ].join('/');

        open(url);
        process.exit();
    });
}
