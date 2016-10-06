var io = require('socket.io-client');
var log = require('./CLogs.js').makeLogger('c-socket');

var is_client = typeof window !== 'undefined';

if(is_client) {

    var socket = io(window.location.origin);

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

}
