const path = require('path');
const util = require('util');

const socketio = require('socket.io');

const {cookieParser,session} = require('./session.js');
const fsm = require('./fsm.js');
const {root} = require('../settings.json');
const log = require('./logging.js').makeLogger('socket');

// ----------------------------------------------------------------------------
exports.connect = function connect(server) {
// ----------------------------------------------------------------------------

log('connecting socketio to server');
var io = new socketio(server);
var total_connections = 0;

var mse = io.of('/fs');

mse.use(function(socket,next) {
    let req = socket.handshake;
    let res = {};
    cookieParser(req,res,function(err) {
        if(err) {
            return next(err);
        } else {
            session(req,res,next);
        }
    });
});

mse.use(function(socket,next) {
    if(socket.handshake.session.registered) {
        return next();
    } else {
        return next(new Error('no session'));
    }
});

mse.on('connection',(socket) => {
    ++total_connections;
    log(`client connected
    username:       ${socket.handshake.session.username}
    connections:    ${total_connections}`);

    socket.on('disconnect',() => {
        --total_connections;
        log(`client disconnect
    username:       ${socket.handshake.session.username}
    connections:    ${total_connections}`);
    });

// ----------------------------------------------------------------------------
// fetch events
// ----------------------------------------------------------------------------

    socket.on('fetch-dir',(dir_path) => {
        log(`fetching dir
    username:   ${socket.handshake.session.username}
    location:   ${dir_path}`);
        let u_root = socket.handshake.session.root;
        let promise = fsm.checkExists(false,u_root,dir_path);
        promise.then((exists) => {
            if(exists) {
                let promise = fsm.retrieveFolder(path.join(u_root,dir_path),dir_path);
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
    username:   ${socket.handshake.session.username}
    location:   ${file_path}`);
        let u_root = socket.handshake.session.root;
        let promise = fsm.checkExists(true,u_root,file_path);
        promise.then((exists) => {
            if(exists) {
                let promise = fsm.retrieveFile(path.join(u_root,file_path),file_path);
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
    username:   ${socket.handshake.session.username}
    location:   ${info.location}
    name:       ${info.name}`);
        let u_root = socket.handshake.session.root;
        let promise = fsm.checkExists(true,u_root,info.location,info.name);
        promise.then((exists) => {
            if(!exists) {
                let promise = fsm.createFile(path.join(u_root,info.location),info.name,info.data);
                promise.then(() => {
                    socket.emit('opp-complete',{opp:'upload',type:'file'});
                    mse.emit('update',{type:'dir',path:info.location,opp:'upload'});
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
    username:   ${socket.handshake.session.username}
    location:   ${info.location},
    name:       ${info.name}`);
        let u_root = socket.handshake.session.root;
        let promise = fsm.checkExists(false,u_root,info.location,info.name);
        promise.then((exists) => {
            if(!exists) {
                let promise = fsm.createDirectory(path.join(u_root,info.location,info.name));
                promise.then(() => {
                    socket.emit('opp-complete',{opp:'upload',type:'dir'});
                    mse.emit('update',{type:'dir',path:info.location,opp:'upload'});
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
    username:   ${socket.handshake.session.username}
    location:   ${info.location}`);
        let u_root = socket.handshake.session.root;
        let promise = fsm.checkExists(true,path.join(u_root,info.location));
        promise.then((exists) => {
            if(exists) {
                let promise = fsm.removeFile(path.join(u_root,info.location));
                promise.then(() => {
                    socket.emit('opp-complete',{opp:'remove',type:'file'});
                    mse.emit('update',{type:'dir',path:info.location,opp:'remove'});
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
    username:   ${socket.handshake.session.username}
    location:   ${info.location}`);
        let u_root = socket.handshake.session.root;
        let promise = fsm.checkIfDirNotEmpty(path.join(u_root,info.location));
        promise.then((size) => {
            if(size === 0 || info.force) {
                let promise = fsm.removeDirectory(path.join(u_root,info.location));
                promise.then(() => {
                    socket.emit('opp-complete',{opp:'remove',type:'dir'});
                    mse.emit('update',{type:'dir',path:info.location,opp:'remove'});
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
