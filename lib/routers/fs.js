// node modules
const util = require('util');
const path = require('path');
const fs = require('fs');
const URL = require('url');

// npm modules
const express = require('express');
const co = require('co');

// app modules
const {renderFSBody,renderLogin} = require('../html.js');
const settings = require('../../settings.json');
const log = require('../logging.js').makeLogger('fs_router');
const {getSalt,getHash} = require('../crypt.js');
const {getNextID} = require('../uid.js');

const db = require('../db.js');

// ----------------------------------------------------------------------------
// variables
// ----------------------------------------------------------------------------

var router = express.Router();

const valid_routes = {
    'GET': {
        '/':1,
        '/fs/login':1,
        '/fs/browse':1,
    },
    'POST': {
        '/fs/user/login':1,
        '/fs/user/logout':1,
        '/fs/user/create':1,
    }
}

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
        if(valid_routes[req.method][req.url]) {
            next();
        } else {
            res.status(404).send('not found');
        }
    }
});

// ----------------------------------------------------------------------------
// get methods
// ----------------------------------------------------------------------------

router.get('/',(req,res) => {
    res.status(300).redirect('/fs/login');
});

router.get('/fs/browse',(req,res) => {
    // log('req.session.registered',req.session.registered);
    if(req.session.root) {
        res.status(200).send(renderFSBody());
    } else {
        res.status(300).redirect('/fs/login');
    }
});

router.get('/fs/login',(req,res) => {
    if(!req.session.root) {
        res.status(200).send(renderLogin());
    } else {
        res.status(300).redirect('/fs/browse');
    }
});

router.get('/fs/user/*',(req,res) => {
    res.status(300).redirect('/fs/login');
});

// ----------------------------------------------------------------------------
// post methods
// ----------------------------------------------------------------------------

router.post('/fs/user/login',(req,res) => {
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
                        res.status(200).json({url:'/fs/browse'});
                    } else {
                        res.status(401).json({username:true,password:false});
                    }
                } else {
                    res.status(400).json({username:false,password:false});
                }
            } catch(err) {
                log('ERROR:',err.message);
                res.status(500).json({msg:'unable to process login'});
            }
        });
    } else {
        log('request is non-xhr request');
    }

});

router.post('/fs/user/create',(req,res) => {
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
                            root: settings.root,
                        }
                        yield db.users.insert(doc);
                        setSession(req,doc);
                        res.status(200).json({url:'/fs/browse'});
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

router.post('/fs/user/logout',(req,res) => {
    if(req.xhr) {
        req.session.destroy();
        res.clearCookie();
        res.status(200).json({url:'/fs/login'});
    } else {
        log('request is non-xhr request');
    }
});

// ----------------------------------------------------------------------------
// export
// ----------------------------------------------------------------------------

module.exports = router;
