const Logs = require('./Logs/main.js');
const {logging} = require('../settings.json');

var item = new Logs(logging);

module.exports = item;
