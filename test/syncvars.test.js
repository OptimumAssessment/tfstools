const test = require('blue-tape');
const syncvars = require('../src/syncvars');
const unsyncvars = require('../src/unsyncvars');
const GitRepo = require('./GitRepo');

const testWithRepo = async(name, callback) => {
    test(name, async(t) => {
        const gitRepo = new GitRepo();
        await gitRepo.create();
        process.chdir( gitRepo.path );

        console.log('create repo');
        return callback(t, gitRepo).finally( ()=> {
            console.log('destroy repo');
            gitRepo.destroy();
        });
    });
}

testWithRepo('Replaces variables from TFS when declared __LIKETHIS__', async(t, gitRepo)=> {
    await gitRepo.commit('init', {
        'config.xml': '<key>storage</key><value>__az.storage.name__</value>',
    });

    await syncvars('Front-End');
    //variable should be replaced with a value (for example not having the __ anymore)
    const contents = await gitRepo.contents('config.xml');
    t.ok( /<key>storage<\/key><value>[a-z0-9]+<\/value>/.test(contents) );
});

testWithRepo('Prevents pushing if replaced values are still in the repo', async(t, gitRepo) => {
    await gitRepo.commit('init', {
        'config.xml': '<key>storage</key><value>__az.storage.name__</value>',
    });

    const shell = gitRepo.shell;
    await syncvars('Front-End');

    //create bare repo to receive push
    const pushTarget = new GitRepo();
    await pushTarget.create(true)
    await shell('git remote add origin '+pushTarget.path);

    //expect push to fail
    await t.shouldFail( shell('git push origin master') );

    //after unsyncvars, expect push to succeed
    await unsyncvars();
    await shell('git push origin master');
    await pushTarget.destroy()
});

   
testWithRepo('Allows you to commit new stuff while still being able to unsyncvar afterwards', async(t, gitRepo) => {
    await gitRepo.commit('init', {
        'config.xml': '<key>storage</key><value>__az.storage.name__</value>',
        'index.js': 'console.log(1)',
    });
    const shell = gitRepo.shell;
    await syncvars('Front-End');

    t.ok( (await gitRepo.contents('config.xml')).match(/<key>storage<\/key><value>[a-z0-9]+<\/value>/) );
    t.is( (await gitRepo.contents('index.js')), 'console.log(1)' );

    await gitRepo.commit('update index', {
        'index.js': 'console.log(2)',
    });
    t.is( (await gitRepo.contents('index.js')), 'console.log(2)' );

    //undo the variable sync
    await unsyncvars();

    // //var is unsynced, index.js is intact
    t.is( (await gitRepo.contents('config.xml')), '<key>storage</key><value>__az.storage.name__</value>' );
    t.is( (await gitRepo.contents('index.js')), 'console.log(2)' );
});
