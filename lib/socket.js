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
var total_connections = 0;

io.on('connection',(socket) => {
    ++total_connections;
    log(`client connected, id: ${socket.id}
    connections: ${total_connections}`);

    socket.on('disconnect',() => {
        --total_connections;
        log(`client disconnect, id: ${socket.id}
    connections: ${total_connections}`);
    });

// ----------------------------------------------------------------------------
// fetch events
// ----------------------------------------------------------------------------

    socket.on('fetch-dir',(dir_path) => {
        log(`fetching dir
    client:     ${socket.id}
    location:   ${dir_path}`);
        let promise = FSM.checkExists(false,root,dir_path);
        promise.then((exists) => {
            if(exists) {
                let promise = FSM.retrieveFolder(path.join(root,dir_path),dir_path);
                promise.then((data) => {
                    socket.emit('opp-complete',{opp:'fetch',type:'dir',data});
                }).catch(() => {
                    socket.emit('opp-failed',{opp:'fetch',type:'dir',msg:'problem when retrieving contents'});
                });
            } else {
                socket.emit('opp-failed',{opp:'fetch',type:'dir',msg:'directory does not exists'});
            }
        }).catch(() => {
            socket.emit('opp-failed',{opp:'fetch',type:'dir',msg:'problem when checking for directory'});
        });
    });

    socket.on('fetch-file',(file_path) => {
        log(`fetching file
    client:     ${socket.id}
    location:   ${file_path}`);
        let promise = FSM.checkExists(true,root,file_path);
        promise.then((exists) => {
            if(exists) {
                let promise = FSM.retrieveFile(path.join(root,file_path),file_path);
                promise.then((data) => {
                    socket.emit('opp-complete',{opp:'fetch',type:'file',data});
                }).catch(() => {
                    socket.emit('opp-failed',{opp:'fetch',type:'file',msg:'problem when retrieving file'});
                });
            } else {
                socket.emit('opp-failed',{opp:'fetch',type:'file',msg:'file not found'});
            }
        }).catch(() => {
            socket.emit('opp-failed',{opp:'fetch',type:'file',msg:'problem when checking for file'});
        });
    });

// ----------------------------------------------------------------------------
// uploading events
// ----------------------------------------------------------------------------

    socket.on('upload-file',(info) => {
        log(`uploading file
    client:     ${socket.id}
    location:   ${info.location}
    name:       ${info.name}`);
        let promise = FSM.checkExists(true,root,info.location,info.name);
        promise.then((exists) => {
            if(!exists) {
                let promise = FSM.createFile(path.join(root,info.location),info.name,info.data);
                promise.then(() => {
                    socket.emit('opp-complete',{opp:'upload',type:'file'});
                    io.emit('update',{type:'dir',path:info.location,opp:'upload'});
                }).catch(() => {
                    socket.emit('opp-failed',{opp:'upload',type:'file',msg:'problem when uploading file'});
                });
            } else {
                socket.emit('opp-failed',{opp:'upload',type:'file',msg:'file exists'});
            }
        }).catch(() => {
            socket.emit('opp-failed',{opp:'upload',type:'file',msg:'problem when check for file'});
        });
    });

    socket.on('upload-dir',(info) => {
        log(`creating dir
    client:     ${socket.id}
    location:   ${info.location},
    name:       ${info.name}`);
        let promise = FSM.checkExists(false,root,info.location,info.name);
        promise.then((exists) => {
            if(!exists) {
                let promise = FSM.createDirectory(path.join(root,info.location,info.name));
                promise.then(() => {
                    socket.emit('opp-complete',{opp:'upload',type:'dir'});
                    io.emit('update',{type:'dir',path:info.location,opp:'upload'});
                }).catch(() => {
                    socket.emit('opp-failed',{opp:'upload',type:'dir',msg:'problem when making directory'});
                });
            } else {
                socket.emit('opp-failed',{opp:'upload',type:'dir',msg:'directory exists'});
            }
        }).catch(() => {
            socket.emit('opp-failed',{opp:'upload',type:'dir',msg:'problem when checking for directory'});
        });
    });

// ----------------------------------------------------------------------------
// removing events
// ----------------------------------------------------------------------------

    socket.on('remove-file',(info) => {
        log(`removing file
    client:     ${socket.id}
    location:   ${info.location}`);
        let promise = FSM.checkExists(true,path.join(root,info.location));
        promise.then((exists) => {
            if(exists) {
                let promise = FSM.removeFile(path.join(root,info.location));
                promise.then(() => {
                    socket.emit('opp-complete',{opp:'remove',type:'file'});
                    io.emit('update',{type:'dir',path:info.location,opp:'remove'});
                }).catch(() => {
                    socket.emit('opp-failed',{opp:'remove',type:'file',msg:'problem when removing file'});
                });
            } else {
                socket.emit('opp-failed',{opp:'remove',type:'file',msg:'file does not exist'});
            }
        }).catch(() => {
            socket.emit('opp-failed',{opp:'remove',type:'file',msg:'problem when checking for file'});
        });
    });

    socket.on('remove-dir',(info) => {
        log(`removing dir
    client:     ${socket.id}
    location:   ${info.location}`);
        let promise = FSM.checkIfDirNotEmpty(path.join(root,info.location));
        promise.then((size) => {
            if(size === 0 || info.force) {
                let promise = FSM.removeDirectory(path.join(root,info.location));
                promise.then(() => {
                    socket.emit('opp-complete',{opp:'remove',type:'dir'});
                    io.emit('update',{type:'dir',path:info.location,opp:'remove'});
                }).catch(() => {
                    socket.emit('opp-failed',{opp:'remove',type:'dir',msg:'problem when removing directory'});
                });
            } else {
                socket.emti('opp-failed',{opp:'remove',type:'dir',msg:'directory is not empty'});
            }
        }).catch(() => {
            socket.emit('opp-failed',{opp:'remove',type:'dir',msg:'problem when checking for directory'});
        });
    });

});

// ----------------------------------------------------------------------------
}
// ----------------------------------------------------------------------------
