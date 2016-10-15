const path = require('path');
const Logs = require('./Logs/main.js');

var dir = path.join(process.cwd(),'log_files');

var item = new Logs(dir,{console:true});

module.exports = item;
