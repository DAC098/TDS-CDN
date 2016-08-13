const express = require('express');
const util = require('util');
const path = require('path');
const fs = require('fs');
const URL = require('url');

const {renderBody} = require('../html.js');
const settings = require('../../settings.json');

var router = express.Router();

function logURL(req) {
    console.log(`req ->
    url: ${req.url}
    params: ${util.inspect(req.params)}
    query: ${util.inspect(req.query)}`);
}

router.get('/',(req,res) => {
    res.status(300).redirect('/fs');
});

router.get('/fs',(req,res) => {
    res.status(200).send(renderBody());
});
/*
router.get('/fs/*',(req,res) => {
    logURL(req);
    var url_split = req.params[0].split(/\//g);
    var is_file = /[\w]\.\w/g.test(url_split[url_split.length - 1]);
    var path = check(settings.root,req.params[0],is_file);
    if(path) {
        if(!is_file) {
            var list = retrieveFolder(path,req.params[0]);
            res.status(200).send(renderList(list));
        } else {
            res.status(200).send('view comming soon');
        }
    } else {
        var str = (is_file) ? 'file not found' : 'directory not found';
        res.status(404).send(str);
    }
});
*/
module.exports = router;
