const express = require('express');
const util = require('util');
const path = require('path');
const fs = require('fs');
const URL = require('url');

const renderList = require('./html.js').renderList;
const check = require('./FS.js').check;
const retrieveFolder = require('./FS.js').retrieveFolder;
const settings = require('../settings.json');

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
    var list = retrieveFolder(settings.root,'');
    res.status(200).send(renderList(list));
});

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

router.get('/cdn/*',(req,res) => {
    var param_array = req.params[0].split('/');
    var result = check(settings.root,req.params[0]);
    if(result) {
        fs.readFile(result,(err,data) => {
            if(err) {
                res.status(500).send('problem sending the file');
            } else {
                res.status(200).send(data);
            }
        });
    } else {
        res.status(404).send('unable to find file:',req.params[0]);
    }
});

module.exports = router;
