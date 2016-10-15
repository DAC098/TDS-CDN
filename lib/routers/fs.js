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

router.get('/',(req,res) => {
    res.status(300).redirect('/fs/browse');
});

router.get('/fs/browse',(req,res) => {
    res.status(200).send(renderFSBody());
});

router.get('/fs/login',(req,res) => {
    res.status(200).send(renderLogin());
});

module.exports = router;
