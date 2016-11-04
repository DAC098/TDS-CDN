// npm modules
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

// json files
const {db} = require('../settings.json');

// log methods
const log = require('./logging.js').makeLog('Store');
const error = require('./logging.js').makeLog('Store','ERROR',true);

let store = new MongoStore({
    uri: `mongodb://${db.host}:${db.port}/fs`,
    collection: 'sessions'
});

store.on('error',(err) => {
    if(err) {
        error(err.message);
    }
});

exports.store = store;

exports.cookieParser = cookieParser('secret');

exports.session = session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:true,
        signed:true
    },
    store: store,
    name:'fs.sid'
});
