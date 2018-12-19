const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const chalk = require('chalk');
const { execSync } = child_process;

const find = require('find');

const unsyncvars = require('./unsyncvars');

module.exports = async( varGroupName ) => {
    try {
        const cwd = process.cwd();
        const varGroup = await getVariableGroupFromTFS(varGroupName);
        await installGitPrePushHook(cwd);
        await undoPreviousSync(cwd);

        // only consider files that are tracked by git
        const searchFiles = execSync('git ls-tree -r HEAD --name-only', { cwd }).toString().trim().split("\n")

        const changes = await findChanges(searchFiles, varGroup);
        if(changes.length > 0) {
            await applyChanges(changes);
            console.log(changes.length+' files updated.');

            await commitAndTag(changes);
            console.log('created and tagged commit.');
        }
    } catch(e) {
        console.log( chalk.red(e.message) );
        process.exit(1);
    }
}

const getVariableGroupFromTFS = async(varGroupName) => {
    if(varGroupName === undefined) {
        throw Error('Usage: tfstools syncvars [variable-group]');
    }
    const axios = await require('./login')();
    const groupsResult = await axios.get('_apis/distributedtask/variablegroups', {
        params: {
            'api-version': '4.0-preview',
            groupName:varGroupName,
        },
    });

    const groups = groupsResult.data.value;
    if(groups.length === 0) {
        throw Error("Variable group '"+varGroupName+"' not found.");
    }
    return groups[0].variables;
}

const findChanges = async(searchFiles, varGroup) => {
    const re = /__([A-z0-9_.-]+[^_])__/g;
    const changes = [];
    await Promise.all(searchFiles.map(f => new Promise(ok => {
        fs.readFile(f, (e,buf) => {
            if(e) { throw e; }

            //replace all instances of __VAR__ that are found in varGroup
            let changed = false;
            const str = buf.toString().replace(re, (match,key) => {
                if(varGroup[key]) {
                    changed = true;
                    return varGroup[key].value;
                } else {
                    console.log( chalk.red( "'"+key+"' not found") );
                    return match;
                }
            });
            if(changed) {
                changes.push( { f, str } );
            }
            ok();
        });
    })));
    return changes;
}

const applyChanges = async(changes) => {
    changes.forEach( ({f}) => {
        //check to see if file already contains changes
        //we dont want existing changes to become part of the droppable git commit
        if(execSync('git diff '+f).toString().trim().length > 0) {
            throw Error(f+' contains variable placeholders but has pending changes. Aborting');
        }
    });
    await Promise.all( changes.map( ({f,str}) => {
        return new Promise(ok => {
            fs.writeFile(f, str, (e)=> {
                if(e) { throw(e) }
                console.log(f,'vars replaced');
                ok();
            });
        });
    }));
}


const commitAndTag = async(changes) => {
    //create a commit and tag it so we can easily undo the var replacement
    execSync("git add "+ changes.map( ({f}) => "'"+f+"'" ));
    execSync("git commit -m 'syncvars replaced variable placeholders with values from TFS'");
    execSync("git tag syncvars");
}

const undoPreviousSync = async(cwd) => {
    if(execSync('git tag', { cwd }).toString().indexOf('syncvars') !== -1) {
        //syncvars tag exists, so we need to undo
        await unsyncvars();
    }
}

const installGitPrePushHook = async(cwd) => {
    const hookFile = path.join(cwd, '.git', 'hooks', 'pre-push');
    const hookContent = `#!/bin/sh
if [ $(git tag -l "syncvars") ]; then
    exit 1
fi
`;
    if(fs.existsSync(hookFile)) {
        if(fs.readFileSync(hookFile).toString() !== hookContent) {
            throw Error(hookFile,'exists but expected to be: "' + hookContent +'"');
        }
    } else {
        fs.writeFileSync(hookFile, hookContent);
    }
    fs.chmodSync( hookFile, '766', ()=> {
        console.log('pre push hook installed');
    });
}
module.exports.tip = 'replaces placeholders with values from TFS vargroup';
