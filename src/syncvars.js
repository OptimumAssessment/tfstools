const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const chalk = require('chalk');
const { execSync } = child_process;

const find = require('find');

const unsyncvars = require('./unsyncvars');

module.exports = async( varGroupName ) => {
    if(varGroupName === undefined) {
        console.log('Usage: tfstools syncvars [variable-group]');
        return;
    }
    const cwd = process.cwd();
    const axios = await require('./login')();
    const groupsResult = await axios.get('_apis/distributedtask/variablegroups', {
        params: {
            'api-version': '4.0-preview',
            groupName:varGroupName,
        },
    });

    const groups = groupsResult.data.value;
    if(groups.length === 0) {
        console.error("Variable group '"+varGroupName+"' not found.");
        process.exit(1);
    }

    await installHook(cwd);

    const vargroup = groups[0].variables;
    await undoIfNeeded(cwd);

    const files = execSync('git ls-tree -r HEAD --name-only', { cwd }).toString().trim().split("\n")
    const changes = await getChanges(files, vargroup);
    if(changes.length > 0) {
        await applyChanges(changes);
        console.log(changes.length+' files updated.');

        await commitAndTag(changes);
        console.log('created and tagged commit.');
    }
}

const getChanges = async(files, vargroup) => {
    const re = /__([A-z0-9_.-]+[^_])__/g;
    const changes = [];
    await Promise.all(files.map(f => new Promise(ok => {
        fs.readFile(f, (e,buf) => {
            if(e) {
                console.error(e);
                process.exit();
            }

            let matched = false;
            const str = buf.toString().replace(re, (match,key) => {
                if(vargroup[key]) {
                    matched = true;
                    return vargroup[key].value;
                } else {
                    console.log( chalk.red( "'"+key+"' not found") );
                    return match;
                }
            });
            if(matched) {
                changes.push( { f, str } );
            }
            ok();
        });
    })));
    return changes;
}

const applyChanges = async(changes) => {
    changes.forEach( ({f}) => {
        if(execSync('git diff '+f).toString().trim().length > 0) {
            console.log( chalk.red(f+' contains variable placeholders, but has pending changes. Aborting') );
            process.exit(1);
        }
    });
    await Promise.all( changes.map( ({f,str}) => {
        return new Promise(ok => {
            fs.writeFile(f, str, (e)=> {
                if(e) {
                    console.error(e);
                    console.log('please checkout changed files and try again');
                    process.exit(1);
                } else {
                    console.log(f,'vars replaced');
                    ok();
                }
            });
        });
    }));
}


const commitAndTag = async(changes) => {
    execSync("git add "+ changes.map( ({f}) => "'"+f+"'" ));
    execSync("git commit -m 'syncvars replaced variable placeholders with values from TFS'");
    execSync("git tag syncvars");
}

const undoIfNeeded = async(cwd) => {
    if(execSync('git tag', { cwd }).toString().indexOf('syncvars') !== -1) {
        await unsyncvars().catch( (e) => {
            console.log('unsyncvars failed, make sure you have no pending changes.');
            console.log(e);
            process.exit(1);
        });
    }
}

const installHook = async(cwd) => {
    const hookFile = path.join(cwd, '.git', 'hooks', 'pre-push');
    const hookContent = `#!/bin/sh
if [ $(git tag -l "syncvars") ]; then
    exit 1
fi
`;
    if(fs.existsSync(hookFile)) {
        if(fs.readFileSync(hookFile).toString() !== hookContent) {
            console.log(hookFile,'exists but expected to be: "' + hookContent +'"');
            process.exit(1);
        }
    } else {
        fs.writeFileSync(hookFile, hookContent);
    }
    fs.chmodSync( hookFile, 0766, ()=> {
        console.log('pre push hook installed');
    });
}
