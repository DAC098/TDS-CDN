var socket = require('socket.io-client')('http://127.0.0.1:3050');

let reconnecting = false;

socket.on('connect',() => {
    console.log('connected to server')
});

socket.on('error',(err) => {
    console.log('error in the connection,',err);
});

socket.on('disconnect',() => console.log('disconnected from server'));

socket.on('reconnect',() => {
    reconnecting = false;
    console.log('reconnected with server');
});

socket.on('reconnecting',() => {
    if(!reconnecting) {
        console.log('attempting to reconnect');
        reconnecting = true;
    }
});

socket.on('reconnect_failed',() => console.log('failed to reconnect with server'));

module.exports = socket;
