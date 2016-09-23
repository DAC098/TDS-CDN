const path = require('path');
const Logs = require('./lib/Logs.js');

var dir = path.join(process.cwd(),'logs');

var item = new Logs(dir,{console:true});

module.exports = item;
