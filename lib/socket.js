const socketio = require('socket.io');

const {retrieveFolder,retrieveFile,check} = require('./FS.js');
const {root} = require('../settings.json');

exports.connect = function connect(server) {
    console.log('connecting socketio to server');
    var io = new socketio(server);

    io.on('connection',(socket) => {
        console.log(`client connected, id: ${socket.id}`);

        socket.on('disconnect',() => {
            console.log(`client disconnect, id: ${socket.id}`);
        });

        socket.on('dir-request',(path) => {
            var lookup = check(false,root,path);
            if(lookup) {
                var list = retrieveFolder(lookup,path);
                if(list) {
                    socket.emit('dir-list',{list});
                } else {
                    socket.emit('dir-not-found',{list:[]});
                }
            } else {
                socket.emit('dir-not-found',{list:[]});
            }
        });

        socket.on('file-request',(path) => {
            var lookup = check(true,root,path);
            if(lookup) {
                var data = retrieveFile(lookup,path);
                if(data) {
                    socket.emit('file-data',{data});
                } else {
                    socket.emit('file-not-found',{data: {}});
                }
            } else {
                socket.emit('file-not-found',{data: {}});
            }
        })

    });
}
