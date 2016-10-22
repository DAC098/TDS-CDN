var io = require('socket.io-client');
var log = require('../CLogs.js').makeLogger('c-socket');
var store = require('../Store.js');

var is_client = typeof window !== 'undefined';

if(is_client) {

    var socket = io(window.location.origin+'/fs');

    let reconnecting = false;
    let count = 0;

    socket.on('connect',() => {
        log('connected to server');
    });

    socket.on('error',(err) => {
        log('error in the connection,',err);
    });

    socket.on('disconnect',() => log('disconnected from server'));

    socket.on('reconnect',() => {
        reconnecting = false;
        count = 0;
        log('reconnected with server');
    });

    socket.on('reconnect_attempt',() => {
        ++count;
        log('count:',count);
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
