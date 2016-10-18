const express = require('express');
const util = require('util');
const path = require('path');
const fs = require('fs');
const URL = require('url');

const {renderFSBody,renderLogin} = require('../html.js');
const settings = require('../../settings.json');
const log = require('../logging.js').makeLogger('fs_router');
const c_table = require('../client_table.js');

var router = express.Router();

function logURL(req) {
    log(`request
    url:    ${req.url}
    params: ${util.inspect(req.params)}
    query:  ${util.inspect(req.query)}`);
}

router.use((req,res,next) => {
    if(settings.https.redirect && !req.secure) {
        log('redirecting to secure server');
        res.status(300).redirect(`https://${settings.https.host}:${settings.https.port}`);
    } else {
        // log('req.xhr:',req.xhr);
        // log('client cookie:',(req.secure) ? req.signedCookies : req.cookies);
        // log('client session:',req.session);
        next();
    }
});

router.get('/',(req,res) => {
    res.status(300).redirect('/fs/login');
});

router.get('/fs/browse',(req,res) => {
    log('req.session.registered',req.session.registered);
    if(req.session.registered) {
        res.status(200).send(renderFSBody());
    } else {
        res.status(300).redirect('/fs/login');
    }
});

router.get('/fs/login',(req,res) => {
    res.status(200).send(renderLogin());
});

router.post('/fs/login/check',(req,res) => {
    // logURL(req);
    log('query',req.query);
    log('post body:',req.body);
    log('xhr:',req.xhr);
    if(req.xhr) {
        switch (req.query.type) {
            case 'username':
                if(req.body.username === 'dev') {
                    res.status(200).json({valid:true});
                } else {
                    res.status(400).json({valid:false});
                }
                break;
            case 'password':
                if(req.body.password === 'dev1' && req.body.username === 'dev') {
                    log('setting session for user');
                    req.session.registered = true;
                    req.session.root = settings.root;
                    res.status(300).redirect('/fs/browse');
                } else {
                    res.status(400).json({valid:false});
                }
                break;
            default:

        }
    } else {
        res.status(300).redirect('/fs/login');
    }
});

module.exports = router;
