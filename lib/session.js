const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

const {db} = require('../settings.json');

const log = require('./logging.js').makeLogger('Store');

let store = new MongoStore({
    uri: `mongodb://${db.host}:${db.port}/fs`,
    collection: 'sessions'
});

store.on('error',(err) => {
    if(err) {
        log('ERROR:',err.message);
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
