const path = require('path');

const socketio = require('socket.io');

const {retrieveFolder,retrieveFile,check,createFilePromise} = require('./FSMethods.js');
const {root} = require('../settings.json');
const log = require('../logging.js').makeLogger('socket');

exports.connect = function connect(server) {
    log('connecting socketio to server');
    var io = new socketio(server);

    io.on('connection',(socket) => {
        log(`client connected, id: ${socket.id}`);

        socket.on('disconnect',() => {
            log(`client disconnect, id: ${socket.id}`);
        });

        socket.on('dir-request',(path) => {
            var lookup = check(false,root,path);
            if(lookup) {
                var list = retrieveFolder(lookup,path);
                if(list) {
                    socket.emit('dir-list',{list});
                } else {
                    socket.emit('dir-not-found',{list:undefined});
                }
            } else {
                socket.emit('dir-not-found',{list:undefined});
            }
        });

        socket.on('file-request',(path) => {
            var lookup = check(true,root,path);
            if(lookup) {
                var data = retrieveFile(lookup,path);
                if(data) {
                    socket.emit('file-data',{data});
                } else {
                    socket.emit('file-not-found',{data: undefined});
                }
            } else {
                socket.emit('file-not-found',{data: undefined});
            }
        });

// ----------------------------------------------------------------------------
// file uploading events
// ----------------------------------------------------------------------------

        socket.on('upload-file',(object) => {
            log('file upload event',object);
            //createFile(path.join(root,object.location),object.name,object.data);
            let promise = createFilePromise(path.join(root,object.location),object.name,object.data);
            promise.then(() => {
                socket.emit('upload-complete');
                io.emit('dir-update',object.location);
            }).catch(() => {
                socket.emit('upload-failed');
            })
        });

    });
}
