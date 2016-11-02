// node modules
const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

// npm modules
const express = require('express');
const bodyParser = require('body-parser');

// app modules
const {cookieParser,session} = require('./lib/session.js');
const logging = require('./lib/logging.js');
const log = logging.makeLogger('server');
const cdn_router = require('./lib/routers/cdn.js');
const fs_router = require('./lib/routers/fs.js');
const settings = require('./settings.json');
const {connect} = require('./lib/socket.js');

logging.startTimer('http_server_start');
logging.startTimer('https_server_start');

var app = express();

var server_http = null;

var server_https = null;

var opt_http = settings.http;

var opt_https = settings.https;

app.use(cookieParser);

app.use(session);

app.use(bodyParser.json());

app.use(express.static('./client'));

app.use('/',fs_router);

if(opt_https.enabled) {
    let options = {
        key: fs.readFileSync(settings.https.key),
        cert: fs.readFileSync(settings.https.cert)
    };

    if('passphrase' in settings.https) {
        options.passphrase = settings.https.passphrase;
    }

    server_https = https.createServer(options,app);

    server_https.listen(opt_https.port,opt_https.host,opt_https.backlog,() => {
        log(`https server info
    host: ${opt_https.host}
    port: ${opt_https.port}`);
        connect(server_https);
        logging.stopTimer('https_server_start');
        log('https start up time:',logging.timerResults('https_server_start'));
        logging.clearTimer('https_server_start');
    });
}

server_http = http.createServer(app).listen(opt_http.port,opt_http.host,opt_http.backlog,() => {
    log(`http server info
    host: ${opt_http.host}
    port: ${opt_http.port}`);
    connect(server_http);
    logging.stopTimer('http_server_start');
    log('start up time:',logging.timerResults('http_server_start'));
    logging.clearTimer('http_server_start');
});
