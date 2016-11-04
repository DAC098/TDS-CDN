const {logging} = require('../settings.json');
const Logger = require('./Logger/index.js')(logging);

module.exports = Logger;
