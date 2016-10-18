const cookieParser = require('cookie-parser');
const session = require('express-session');

exports.cookieParser = cookieParser('secret');

exports.session = session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:true,
        signed:true,
    },
    name:'fs.sid',
});
