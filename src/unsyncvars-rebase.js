const fs = require('fs');
const [,,file] = process.argv;
const result = fs.readFileSync(file).toString().replace(/pick/,'drop');
fs.writeFileSync(file, result);
