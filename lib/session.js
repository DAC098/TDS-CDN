const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

const {db} = require('../settings.json');

let store = new MongoStore({
    uri: `mongodb://${db.host}:${db.port}/fs`,
    collection: 'sessions'
});

exports.store = store;

exports.cookieParser = cookieParser('secret');

exports.session = session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:true,
        signed:true,
    },
    store: store,
    name:'fs.sid',
});
