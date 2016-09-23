const express = require('express');
const fs = require('fs');

const check = require('../FS.js').check;
const settings = require('../../settings.json');

var router = express.Router();

router.get('*',(req,res) => {
    var param_array = req.params[0].split('/');
    var result = check(true,settings.root,req.params[0]);
    if(result) {
        fs.readFile(result,(err,data) => {
            if(err) {
                res.status(500).send('problem sending the file');
            } else {
                res.status(200).send(data);
            }
        });
    } else {
        res.status(404).send(`unable to find file: ${req.params[0]}`);
    }
});

module.exports = router;
