const express = require('express');
const http = require('http');

const router = require('./lib/routers/router.js');

const cdn_router = require('./lib/routers/cdn.js');
const fs_router = require('./lib/routers/file_sys.js');

var app = express();

app.use('/',fs_router);

app.use('/cdn',cdn_router);

const server = http.createServer(app).listen(3050,() => {
    console.log('server listening on port 3050');
});
