const syncvars = require('../src/syncvars');
const unsyncvars = require('../src/unsyncvars');
const GitRepo = require('./GitRepo');

let gitRepo;
beforeEach( async()=> {
    gitRepo = new GitRepo();
    await gitRepo.create();
    process.chdir( gitRepo.path );
});
afterEach( async()=> {
    await gitRepo.destroy();
});


describe('Given a repo with var-injectable files', () => {
    it('Replaces variables from TFS when declared __LIKETHIS__', async()=> {
        await gitRepo.commit('init', {
            'config.xml': '<key>storage</key><value>__az.storage.name__</value>',
        });
        
        await syncvars('Front-End');
        const contents = await gitRepo.contents('config.xml');

        //variable should be replaced with a value (for example not having the __ anymore)
        expect( contents ).toMatch(/<key>storage<\/key><value>[a-z0-9]+<\/value>/);
    });

    it('Prevents pushing if replaced values are still in the repo', async() => {
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
        await expect(shell('git push origin master')).rejects.toThrow();

        //after unsyncvars, expect push to succeed
        await unsyncvars();
        await shell('git push origin master');

        await pushTarget.destroy()
    });

   
    it('Allows you to commit new stuff while still being able to unsyncvar afterwards', async() => {
        await gitRepo.commit('init', {
            'config.xml': '<key>storage</key><value>__az.storage.name__</value>',
            'index.js': 'console.log(1)',
        });
        const shell = gitRepo.shell;
        await syncvars('Front-End');

        //var is synced, index.js is intact
        await expect( gitRepo.contents('config.xml') ).resolves.toMatch(/<key>storage<\/key><value>[a-z0-9]+<\/value>/);
        await expect( gitRepo.contents('index.js') ).resolves.toBe('console.log(1)');

        await gitRepo.commit('update index', {
            'index.js': 'console.log(2)',
        });
        await expect( gitRepo.contents('index.js') ).resolves.toBe('console.log(2)');

        //undo the variable sync
        await unsyncvars();

        //var is unsynced, index.js is intact
        await expect( gitRepo.contents('config.xml') ).resolves.toBe('<key>storage</key><value>__az.storage.name__</value>');
        await expect( gitRepo.contents('index.js') ).resolves.toBe('console.log(2)');

    });
});
