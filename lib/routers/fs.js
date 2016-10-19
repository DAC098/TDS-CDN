const express = require('express');
const util = require('util');
const path = require('path');
const fs = require('fs');
const URL = require('url');

const {renderFSBody,renderLogin} = require('../html.js');
const settings = require('../../settings.json');
const log = require('../logging.js').makeLogger('fs_router');

var router = express.Router();

function logURL(req) {
    log(`request
    url:    ${req.url}
    params: ${util.inspect(req.params)}
    query:  ${util.inspect(req.query)}`);
}

var valid_routes = {
    'GET': {
        '/':1,
        '/fs/login':1,
        '/fs/browse':1,
    },
    'POST': {
        '/fs/login/check':1
    }
}

router.use((req,res,next) => {
    if(settings.https.redirect && !req.secure) {
        log('redirecting to secure server');
        res.status(300).redirect(`https://${settings.https.host}:${settings.https.port}`);
    } else {
        // log('req.xhr:',req.xhr);
        // log('client cookie:',(req.secure) ? req.signedCookies : req.cookies);
        // log('client session:',req.session);
        if(valid_routes[req.method][req.url]) {
            next();
        } else {
            res.status(404).send('not found');
        }
    }
});

router.get('/',(req,res) => {
    res.status(300).redirect('/fs/login');
});

router.get('/fs/browse',(req,res) => {
    // log('req.session.registered',req.session.registered);
    if(req.session.registered) {
        res.status(200).send(renderFSBody());
    } else {
        res.status(300).redirect('/fs/login');
    }
});

router.get('/fs/login',(req,res) => {
    if(!req.session.registered) {
        res.status(200).send(renderLogin());
    } else {
        res.status(300).redirect('/fs/browse');
    }
});

router.post('/fs/login/check',(req,res) => {
    // logURL(req);
    // log('query',req.query);
    // log('post body:',req.body);
    // log('xhr:',req.xhr);
    if(req.xhr) {
        if(req.body.password === 'dev1' && req.body.username === 'dev') {
            log('setting session for user');
            req.session.registered = true;
            req.session.root = settings.root;
            req.session.username = req.body.username;
            res.status(300).json({url:'/fs/browse'});
        } else {
            let code = 400;
            let valid = {
                username: req.body.username === 'dev',
                password: false
            };
            code = (valid.username) ? 401 : code;
            res.status(code).json(valid);
        }
    } else {
        log('request is non-xhr request');
    }
});

router.get('/fs/login/check',(req,res) => {
    res.status(300).redirect('/fs/login');
});

module.exports = router;
