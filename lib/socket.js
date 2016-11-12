// node modules
const path = require('path');
const util = require('util');

// npm modules
const socketio = require('socket.io');
const co = require('co');

// app modules
const {cookieParser,session} = require('./session.js');
const fsm = require('./fsm.js');

// json files
const {root} = require('../settings.json');

// log methods
const log = require('./logging.js').makeLog('socket');
const error = require('./logging.js').makeLog('socket','ERROR',true);

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
	if(socket.handshake.session.root) {
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
		co(function*() {
			let u_root = socket.handshake.session.root;
			try {
				let exists = yield fsm.checkExists(false,u_root,dir_path);
				if(exists) {
					let data = yield fsm.retrieveFolder(path.join(u_root,dir_path),dir_path);
					socket.emit('opp-complete',{opp:'fetch',type:'dir',data});
				} else {
					socket.emit('opp-failed',{opp:'fetch',type:'dir',msg:'directory does not exists'});
				}
			} catch(err) {
				error(err.message);
				socket.emit('opp-failed',{opp:'fetch',type:'dir',msg:'problem when fetching directory'});
			}
		});
	});

	socket.on('fetch-file',(file_path) => {
		log(`fetching file
	username:   ${socket.handshake.session.username}
	location:   ${file_path}`);
		co(function*() {
			let u_root = socket.handshake.session.root;
			try {
				let exists = yield fsm.checkExists(true,u_root,file_path);
				if(exists) {
					let data = yield fsm.retrieveFile(path.join(u_root,file_path),file_path);
					socket.emit('opp-complete',{opp:'fecth',type:'dir',data});
				} else {
					socket.emit('opp-failed',{opp:'fetch',type:'file',msg:'file not found'});
				}
			} catch(err) {
				error(err.message);
				socket.emit('opp-failed',{opp:'fetch',type:'file',msg:'problem when fetching file'});
			}
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
		co(function*() {
			let u_root = socket.handshake.session.root;
			try {
				let exists = yield fsm.checkExists(true,u_root,info.location,info.name);
				if(!exists) {
					yield fsm.createFile(path.join(u_root,info.location),info.name,info.data);
					socket.emit('opp-complete',{opp:'upload',type:'file'});
					mse.emit('update',{type:'dir',path:info.location,opp:'upload'});
				} else {
					socket.emit('opp-failed',{opp:'upload',type:'file',msg:'file exists'});
				}
			} catch(err) {
				error(err.message);
				socket.emit('opp-failed',{opp:'upload',type:'file',msg:'problem when uploading file'});
			}
		});
	});

	socket.on('upload-dir',(info) => {
		log(`creating dir
	username:   ${socket.handshake.session.username}
	location:   ${info.location},
	name:       ${info.name}`);
		co(function*() {
			let u_root = socket.handshake.session.root;
			try {
				let exists = yield fsm.checkExists(false,u_root,info.location,info.name);
				if(!exists) {
					yield fsm.createDirectory(path.join(u_root,info.location,info.name));
					socket.emit('opp-complete',{opp:'upload',type:'dir'});
					mse.emit('update',{type:'dir',path:info.location,opp:'upload'});
				} else {
					socket.emit('opp-failed',{opp:'upload',type:'dir',msg:'directory exists'});
				}
			} catch(err) {
				error(err.message);
				socket.emit('opp-failed',{opp:'upload',type:'dir',msg:'problem when uploading directory'});
			}
		});
	});

// ----------------------------------------------------------------------------
// removing events
// ----------------------------------------------------------------------------

	socket.on('remove-file',(info) => {
		log(`removing file
	username:   ${socket.handshake.session.username}
	location:   ${info.location}`);
		co(function*() {
			let u_root = socket.handshake.session.root;
			try {
				let exists = yield fsm.checkExists(true,path.join(u_root,info.location));
				if(exists) {
					yield fsm.removeFile(path.join(u_root,info.location));
					socket.emit('opp-complete',{opp:'remove',type:'file'});
					mse.emit('update',{type:'dir',path:info.location,opp:'remove'});
				} else {
					socket.emit('opp-failed',{opp:'remove',type:'file',msg:'file does not exist'});
				}
			} catch(err) {
				error(err.message);
				socket.emit('opp-failed',{opp:'remove',type:'file',msg:'problem when removing file'});
			}
		});
	});

	socket.on('remove-dir',(info) => {
		log(`removing dir
	username:   ${socket.handshake.session.username}
	location:   ${info.location}`);
		co(function*() {
			let u_root = socket.handshake.session.root;
			try {
				let size = yield fsm.checkIfDirNotEmpty(path.join(u_root,info.location));
				if(size === 0 || info.force) {
					yield fsm.removeDirectory(path.join(u_root,info.location));
					socket.emit('opp-complete',{opp:'remove',type:'dir'});
					mse.emit('update',{type:'dir',path:info.location,opp:'remove'});
				} else {
					socket.emti('opp-failed',{opp:'remove',type:'dir',msg:'directory is not empty'});
				}
			} catch(err) {
				error(err.message);
				socket.emit('opp-failed',{opp:'remove',type:'dir',msg:'problem when removing directory'});
			}
		});
	});

});

// ----------------------------------------------------------------------------
};
// ----------------------------------------------------------------------------
