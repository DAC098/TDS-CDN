const path = require('path');
const util = require('util');

const socketio = require('socket.io');

const {retrieveFolder,retrieveFile,check,createFile,removeFile,checkExists} = require('./FSMethods.js');
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

        socket.on('dir-request',(dir_path) => {
            var lookup = check(false,root,dir_path);
            if(lookup) {
                var list = retrieveFolder(lookup,dir_path);
                if(list) {
                    socket.emit('dir-list',{list});
                } else {
                    socket.emit('dir-not-found',{list:undefined});
                }
            } else {
                socket.emit('dir-not-found',{list:undefined});
            }
        });

        socket.on('file-request',(file_path) => {
            var lookup = check(true,root,file_path);
            if(lookup) {
                var data = retrieveFile(lookup,file_path);
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
// uploading events
// ----------------------------------------------------------------------------

        socket.on('upload-file',(object) => {
            log('file upload event',object);
            let promise = checkExists(true,root,object.location,object.name);
            promise.then((exists) => {
                if(!exists) {
                    let promise = createFile(path.join(root,object.location),object.name,object.data);
                    promise.then(() => {
                        socket.emit('upload-complete');
                        io.emit('dir-update',object.location);
                    }).catch(() => {
                        socket.emit('upload-failed');
                    });
                } else {
                    socket.emit('upload-exists');
                }
            }).catch(() => {
                socket.emit('upload-failed');
            });
        });

        socket.on('upload-dir',(info) => {
            log('creating',info.name,'dir at',info.location);

        });

// ----------------------------------------------------------------------------
// removing events
// ----------------------------------------------------------------------------

        socket.on('remove-file',(info) => {
            log('removing file',info.name,'from',info.location);
            let promise = removeFile(path.join(root,info.location),info.name);
            promise.then(() => {
                socket.emit('remove-complete');
                io.emit('dir-update',info.location);
            }).catch(() => {
                socket.emit('remove-failed');
            });
        });

        socket.on('remove-dir',(info) => {
            log('removing dir',info.name,'from',info.location);

        });

    });
}
