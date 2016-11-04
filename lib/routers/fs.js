// node modules
const util = require('util');
const path = require('path');
const fs = require('fs');
const URL = require('url');

// npm modules
const express = require('express');
const co = require('co');

// app modules
const fsm = require('../fsm.js');
const {htmlBody} = require('../html.js');
const {getSalt,getHash} = require('../crypt.js');
const {getNextID} = require('../uid.js');
const db = require('../db.js');

// json files
const settings = require('../../settings.json');

// log methods
const log = require('../logging.js').makeLog('fs_router');
const error = require('../logging.js').makeLog('fs_router','ERROR',true);

// ----------------------------------------------------------------------------
// variables
// ----------------------------------------------------------------------------

var router = express.Router();

// ----------------------------------------------------------------------------
// functions
// ----------------------------------------------------------------------------

function logURL(req) {
    log(`request
    url:    ${req.url}
    params: ${util.inspect(req.params)}
    query:  ${util.inspect(req.query)}`);
}

function setSession(req,doc) {
    req.session._id = doc._id;
    req.session.username = doc.username;
    req.session.root = doc.root;
}

// ----------------------------------------------------------------------------
// middle ware
// ----------------------------------------------------------------------------

router.use((req,res,next) => {
    if(settings.https.redirect && !req.secure) {
        log('redirecting to secure server');
        res.status(300).redirect(`https://${settings.https.host}:${settings.https.port}`);
    } else {
        next();
    }
});

// ----------------------------------------------------------------------------
// get methods
// ----------------------------------------------------------------------------

router.get('/',(req,res) => {
    res.status(300).redirect('/login');
});

router.get('/browse',(req,res) => {
    // log('req.session.registered',req.session.registered);
    try {
        if(req.session.root) {
            res.status(200).send(htmlBody('fs',{username:req.session.username}));
        } else {
            res.status(300).redirect('/login');
        }
    } catch(err) {
        error(err.message);
        res.status(500).send('server error');
    }
});

router.get('/login',(req,res) => {
    try {
        if(!req.session.root) {
            res.status(200).send(htmlBody('login'));
        } else {
            res.status(300).redirect('/browse');
        }
    } catch(err) {
        error(err.message);
        res.status(500).send('server error');
    }
});

router.get('/user/*',(req,res) => {
    res.status(300).redirect('/login');
});

router.get('/retrieve/*',(req,res) => {
    co(function*() {
        if(req.session.root) {
            try {
                let file_path = path.join(req.session.root,req.params[0]);
                let exists = yield fsm.checkExists(true,req.session.root,req.params[0]);
                if(exists) {
                    let data = yield fsm.getFile(file_path);
                    res.status(200).send(data);
                } else {
                    res.status(404).send('file not found'+req.params[0]);
                }
            } catch(err) {
                error(err.message);
                res.status(500).send('server error');
            }
        }
    });
});

// ----------------------------------------------------------------------------
// post methods
// ----------------------------------------------------------------------------

router.post('/user/login',(req,res) => {
    if(req.xhr) {
        co(function*() {
            let {username,password} = req.body;
            try {
                let doc = yield db.users.find({username}).toArray();
                if(doc.length !== 0) {
                    doc = doc[0];
                    let check = getHash(password,doc.salt);
                    if(check === doc.password) {
                        setSession(req,doc);
                        res.status(200).json({url:'/browse'});
                    } else {
                        res.status(401).json({username:true,password:false});
                    }
                } else {
                    res.status(400).json({username:false,password:false});
                }
            } catch(err) {
                error(err.message);
                res.status(500).json({msg:'unable to process login'});
            }
        });
    } else {
        log('request is non-xhr request');
    }

});

router.post('/user/create',(req,res) => {
    if(req.xhr) {
        co(function*() {
            try {
                let {username,password,confirm_password} = req.body;
                let username_check = yield db.users.find({username}).toArray();
                if(username_check.length === 0) {
                    if(password === confirm_password) {
                        let salt = getSalt();
                        let doc = {
                            _id: getNextID(),
                            username,
                            password: getHash(password,salt),
                            salt,
                            root: settings.root
                        };
                        yield db.users.insert(doc);
                        setSession(req,doc);
                        res.status(200).json({url:'/browse'});
                    } else {
                        res.status(409).json({password:false});
                    }
                } else {
                    res.status(409).json({username:false});
                }
            } catch(err) {
                log('ERROR:',err.message);
                res.status(500).json({msg:'unable to create account'});
            }
        });
    } else {
        log('request is non-xhr');
    }
});

router.post('/user/logout',(req,res) => {
    if(req.xhr) {
        req.session.destroy();
        res.clearCookie();
        res.status(200).json({url:'/login'});
    } else {
        log('request is non-xhr request');
    }
});

// ----------------------------------------------------------------------------
// catch all
// ----------------------------------------------------------------------------

router.get('*',(req,res) => {
    res.status(404).send('not found');
});

// ----------------------------------------------------------------------------
// export
// ----------------------------------------------------------------------------

module.exports = router;
