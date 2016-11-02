const express = require('express');
const fs = require('fs');

const {check} = require('../fsm.js');
const settings = require('../../settings.json');
const log = require('../logging.js').makeLogger('cdn');

var router = express.Router();

router.get('*',(req,res) => {
    var param_array = req.params[0].split('/');
    var result = check(true,req.session.root,req.params[0]);
    try {
        if(result) {
            fs.readFile(result,(err,data) => {
                if(err) {
                    res.status(500).send('problem sending the file');
                } else {
                    res.status(200).send(data);
                }
            });
        } else {
            log('file does not exist',req.params[0]);
            res.status(404).send(`unable to find file: ${req.params[0]}`);
        }
    } catch(err) {
        log('ERROR:',err.message);
        res.status(500).send('server error');
    }
});

module.exports = router;
