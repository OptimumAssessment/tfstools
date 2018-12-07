
module.exports = async( name ) => name !== undefined ? name : process.cwd().split('/').pop();
