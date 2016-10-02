const path = require('path');
const util = require('util');

const socketio = require('socket.io');

const FSM = require('./FSMethods.js');
const {root} = require('../settings.json');
const log = require('../logging.js').makeLogger('socket');

// ----------------------------------------------------------------------------
exports.connect = function connect(server) {
// ----------------------------------------------------------------------------

log('connecting socketio to server');
var io = new socketio(server);

io.on('connection',(socket) => {
    log(`client connected, id: ${socket.id}`);

    socket.on('disconnect',() => {
        log(`client disconnect, id: ${socket.id}`);
    });

// ----------------------------------------------------------------------------
// request events
// ----------------------------------------------------------------------------

    socket.on('fetch-dir',(dir_path) => {
        let promise = FSM.checkExists(false,root,dir_path);
        promise.then((exists) => {
            if(exists) {
                let promise = FSM.retrieveFolder(path.join(root,dir_path),dir_path);
                promise.then((data) => {
                    socket.emit('fetch-complete',{type:'dir',data});
                }).catch(() => {
                    socket.emit('fetch-failed',{type:'dir',msg:'problem when retrieving contents'});
                });
            } else {
                socket.emit('fetch-failed',{type:'dir',msg:'directory does not exists'});
            }
        });
    });

    socket.on('fetch-file',(file_path) => {
        let promise = FSM.checkExists(true,root,file_path);
        promise.then((exists) => {
            if(exists) {
                let promise = FSM.retrieveFile(path.join(root,file_path),file_path);
                promise.then((data) => {
                    socket.emit('fetch-complete',{type:'file',data});
                }).catch(() => {
                    socket.emit('fetch-failed',{type:'file',msg:'problem when retrieving file'});
                });
            } else {
                socket.emit('fetch-failed',{type:'file',msg:'file not found'});
            }
        });
    });

// ----------------------------------------------------------------------------
// uploading events
// ----------------------------------------------------------------------------

    socket.on('upload-file',(info) => {
        log('file upload event',info);
        let promise = FSM.checkExists(true,root,info.location,info.name);
        promise.then((exists) => {
            if(!exists) {
                let promise = FSM.createFile(path.join(root,info.location),info.name,info.data);
                promise.then(() => {
                    socket.emit('upload-complete',{type:'file'});
                    io.emit('update',{type:'dir',path:info.location,opp:'upload'});
                }).catch(() => {
                    socket.emit('upload-failed',{type:'file'});
                });
            } else {
                socket.emit('upload-exists',{type:'file'});
            }
        }).catch(() => {
            socket.emit('upload-failed',{type:'file'});
        });
    });

    socket.on('upload-dir',(info) => {
        log('creating',info.name,'dir at',info.location);
        let promise = FSM.checkExists(false,root,info.location,info.name);
        promise.then((exists) => {
            if(!exists) {
                let promise = FSM.createDirectory(path.join(root,info.location,info.name));
                promise.then(() => {
                    socket.emit('upload-complete',{type:'dir'});
                    io.emit('update',{type:'dir',path:info.location,opp:'upload'});
                }).catch(() => {
                    socket.emit('upload-failed',{type:'dir'});
                });
            } else {
                socket.emit('upload-exists',{type:'dir'});
            }
        }).catch(() => {
            socket.emit('upload-failed',{type:'dir'});
        });
    });

// ----------------------------------------------------------------------------
// removing events
// ----------------------------------------------------------------------------

    socket.on('remove-file',(info) => {
        log('removing file',info.location);
        let promise = FSM.removeFile(path.join(root,info.location));
        promise.then(() => {
            socket.emit('remove-complete',{type:'file'});
            io.emit('update',{type:'dir',path:info.location,opp:'remove'});
        }).catch(() => {
            socket.emit('remove-failed',{type:'file'});
        });
    });

    socket.on('remove-dir',(info) => {
        log('removing dir',info.location);
        let promise = FSM.checkIfDirNotEmpty(path.join(root,info.location));
        promise.then((size) => {
            if(size === 0 || info.force) {
                let promise = FSM.removeDirectory(path.join(root,info.location));
                promise.then(() => {
                    socket.emit('remove-complete',{type:'dir'});
                    io.emit('update',{type:'dir',path:info.location,opp:'remove'});
                }).catch(() => {
                    socket.emit('remove-failed',{type:'dir',msg:'problem when removing directory'});
                });
            } else {
                socket.emti('remove-failed',{type:'dir',msg:'directory is not empty'});
            }
        });
    });

});

// ----------------------------------------------------------------------------
}
// ----------------------------------------------------------------------------
