const Logger = require('./index.js')({console:true,file:true});

const log = Logger.makeLog('test','stuff');
const error = Logger.makeLog('test','ERROR',true);

log('other things in here');

log('cool stuff here');

error('bad stuff');

error('other bad stuff');
