
const path = require('path');
module.exports = async( name ) => name !== undefined ? name : process.cwd().split(path.sep).pop();
