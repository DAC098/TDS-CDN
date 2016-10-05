var regex = /(http?s\:\/\/.*)\/.*/g;
var result = regex.exec(window.location);
var address = result[1];
console.log('result from regex:',address);

var socket = require('socket.io-client')('http://127.0.0.1:3050');
var log = require('./CLogs.js').makeLogger('socket');

let reconnecting = false;

socket.on('connect',() => {
    log('connected to server')
});

socket.on('error',(err) => {
    log('error in the connection,',err);
});

socket.on('disconnect',() => log('disconnected from server'));

socket.on('reconnect',() => {
    reconnecting = false;
    log('reconnected with server');
});

socket.on('reconnecting',() => {
    if(!reconnecting) {
        log('attempting to reconnect');
        reconnecting = true;
    }
});

socket.on('reconnect_failed',() => log('failed to reconnect with server'));

module.exports = socket;
