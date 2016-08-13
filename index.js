const express = require('express');
const http = require('http');

const router = require('./lib/router.js');

var app = express();

app.use('/',router);

const server = http.createServer(app).listen(3050,() => {
    console.log('server listening on port 3050');
});
