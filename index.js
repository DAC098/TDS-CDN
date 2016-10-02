const express = require('express');
const http = require('http');

const log = require('./logging.js').makeLogger('server');
const cdn_router = require('./lib/routers/cdn.js');
const fs_router = require('./lib/routers/file_sys.js');
const {connect} = require('./lib/socket.js');

var app = express();

app.use(express.static('./static'));

app.use(express.static('./assets'));

app.use('/',fs_router);

app.use('/cdn',cdn_router);

const server = http.createServer(app).listen(3050,() => {
    log('server listening on port 3050');
});

connect(server);
