// node modules
const events = require('events');

// npm modules
const MongoClient = require('mongodb').MongoClient;
const co = require('co');

// app modules
const logger = require('./logging.js');

// json files
const settings = require('../settings.json');

// log methods
const log = logger.makeLog('db');
const error = logger.makeLog('db','ERROR',true);

const db = function db() {

    logger.tStart('mongo_startup');

    events.call(this);
    db.prototype.__proto__ = events.prototype;

    const self = this;

    var main = null;

    var users = null;

    var files = null;

    var directories = null;

    var ready = false;

    co(function*() {
        log('connecting to mongodb');
        try {
            main = yield MongoClient.connect(`mongodb://${settings.db.host}:${settings.db.port}/fs`);
            users = yield main.createCollection('users');
            files = yield main.createCollection('files');
            directories = yield main.createCollection('directories');

            main.on('authenticated',(obj) => {
                log('db authenticated');
            });

            main.on('close',(err) => {
                log('db closed');
                if(err) error(err.message);
            });

            main.on('error',(err) => {
                error(err.message);
            });

            main.on('fullsetup',(db) => {
                log('db setup');
            });

            main.on('parseError',(err) => {
                error('parseError -',err.message);
            });

            main.on('reconnect',(obj) => {
                log('db reconnected');
            });

            main.on('timeout',(err) => {
                error('timeout -',err.message);
            });

            Object.defineProperties(self,{
                'main': {
                    get: () => {
                        return main;
                    },
                    set: () => {}
                },
                'users': {
                    get: () => {
                        return users;
                    },
                    set: () => {}
                },
                'files': {
                    get: () => {
                        return files;
                    },
                    set: () => {}
                },
                'directories': {
                    get: () => {
                        return directories;
                    },
                    set: () => {}
                }
            });

            ready = true;
            self.emit('ready');

            logger.tStop('mongo_startup');
            log('ready, time:',logger.tResults('mongo_startup'));
            logger.tClear('mongo_startup');
        } catch(err) {
            error(err.message);
            logger.stopTimer('mongo_startup');
            logger.clearTimer('mongo_startup');
        }

    });

    Object.defineProperty(self,'ready',{
        get: function() {
            return ready;
        },
        set: function() {}
    });

};

var item = new db();

module.exports = item;
