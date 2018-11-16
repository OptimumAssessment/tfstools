const tmp = require('tmp');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const rimraf = require('rimraf');

module.exports = class GitRepo {
    //creates a new git repo in a tmp dir
    create(bare = false) {
        return new Promise((ok,fail) => {
            tmp.dir( async(err, path, cleanupCallback) => {
                if (err) throw err;
                this.path = path;
                this.shell = workdirShell(path);
                this.shell('git init' + (bare ? ' --bare' : '')).then(ok);
            });
        });
    }

    destroy() {
        return new Promise(ok => rimraf(this.path, ok));
    }

    //returns the contents of filename, local to this repo
    contents(filename) {
        return new Promise((ok,fail) => {
            const abs = path.join(this.path, filename);
            fs.readFile( abs, (e,cnt) => {
                e ? fail(e) : ok(cnt.toString());
            });
        });
    }

    // creates a commit
    // files is a map with entries filename: 'contents'
    commit(message, files) {
        const base = this.path;
        const shell = this.shell;
        return new Promise(async(ok,fail) => {
            await Promise.all(
                Object.entries(files).map(([f,c]) => new Promise( (ok,fail) => {
                    const abs = path.join(base, f);
                    fs.writeFile(abs, c, e => {
                        e ? fail() : ok()
                    });
                }))
            );
            const filesToAdd = Object.keys(files).map( f => `'${f}'`).join(' ');
            await shell('git add ' + filesToAdd);
            await shell('git commit -m "'+message+'"');
            ok();

        });
    }

    // shell executes a command in the git repo dir
    // logShell executes a command in the git repo dir and logs about it
    async logShell(cmd) {
        console.log(cmd);
        const { out, err } = await gitRepo.shell(cmd);
        console.log(out);
        console.log(err);
    }
};

// returns a shell method that executes in the provided working directory
const workdirShell = (cwd) => (cmd) => new Promise((ok,fail) => {
    child_process.exec(cmd, { cwd }, (e,out,err) => {
        e ? fail(e) : ok({out, err});
    });
});
