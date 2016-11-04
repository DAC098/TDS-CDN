// node modules
const http = require('http');
const https = require('https');
const fs = require('fs');
const crypt = require('crypto');
const path = require('path');

// npm modules
const express = require('express');
const bodyParser = require('body-parser');

// app modules
const {cookieParser,session} = require('./session.js');
const logging = require('./logging.js');
const router = require('./routers/fs.js');
const {connect} = require('./socket.js');

// json files
const settings = require('../settings.json');

// log methods
const log = logging.makeLog('server');
const error = logging.makeLog('server','ERROR',true);

function Server() {

    const self = this;

    const root = process.cwd();

    var http_server = null;

    var http_started = false;

    var https_server = null;

    var https_started = false;

    var app = express();

    app.use(cookieParser);
    app.use(session);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));

    app.use(express.static(path.join(root,'client')));
    app.use('/',router);

    this.startHTTP = function startHTTP() {
        try {
            logging.tStart('http_server_start');

            let opt = settings.http;

            http_server = http.createServer(app).listen(opt.port,opt.host,opt.backlog,() => {
                connect(http_server);
                http_started = true;

                logging.tStop('http_server_start');
                log(`http server info
    host: ${opt.host}
    port: ${opt.port}
    startup time: ${logging.tResults('http_server_start')}`);
                logging.tClear('http_server_start');
            });
        } catch(err) {
            error('http server failed to start:',err.message);
            logging.tStop('http_server_start');
            logging.tClear('http_server_start');
        }
    };

    this.startHTTPS = function startHTTPS() {
        try {
            logging.tStart('https_server_start');

            let opt = settings.https;

            let cert = {
                key: fs.readFileSync(opt.key),
                cert: fs.readFileSync(opt.cert)
            };

            if('passphrase' in opt) {
                cert.passphrase = opt.passphrase;
            }

            https_server = https.createServer(cert,app).listen(opt.port,opt.host,opt.backlog,() => {
                connect(https_server);
                https_started = true;

                logging.tStop('https_server_start');
                log(`https server info
    host: ${opt.host}
    port: ${opt.port}
    startup time: ${logging.tResults('https_server_start')}`);
                logging.tClear('https_server_start');
            });

        } catch(err) {
            error('https server failed to start:',err.message);
            logging.tStop('https_server_start');
            logging.tClear('https_server_start');
        }
    };

    this.closeHTTP = function closeHTTP() {
        if(http_started) {
            http_server.close();
        } else {
            error('http server is not started');
        }
    };

    this.closeHTTPS = function closeHTTPS() {
        if(https_started) {
            https_server.close();
        } else {
            error('https server is not started');
        }
    };

    Object.defineProperties(self,{
        'http_started': {
            get: function() {
                return http_started;
            },
            set: function() {}
        },
        'https_started': {
            get: function() {
                return https_started;
            },
            set: function() {}
        }
    });

};

module.exports = Server;
