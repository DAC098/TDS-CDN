const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const logging = require('./lib/logging.js');
const log = logging.makeLogger('server');
const cdn_router = require('./lib/routers/cdn.js');
const fs_router = require('./lib/routers/fs.js');
const settings = require('./settings.json');
const {connect} = require('./lib/socket.js');

logging.startTimer('server_start');

var app = express();

var server = null;

var listen_options = {};

app.use(express.static('./compiled'));

app.use(express.static('./assets'));

app.use('/',fs_router);

app.use('/cdn',cdn_router);

if(!settings.https.enabled) {

    server = http.createServer(app);

    listen_options = settings.http;

} else {
    let options = {
        key: fs.readFileSync(settings.https.key),
        cert: fs.readFileSync(settings.https.cert),
    };

    server = https.createServer(app,options);

    listen_options = settings.https;
}

server.listen(listen_options.port,listen_options.host,listen_options.backlog,() => {
    log(`server info
    host: ${listen_options.host}
    port: ${listen_options.port}`);
    connect(server);
    logging.stopTimer('server_start');
    log('start up time:',logging.timerResults('server_start'));
    logging.clearTimer('server_start');
});
