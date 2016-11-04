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

    var connectors = {
        main: null,
        users: null,
        files: null,
        directories: null
    };

    co(function*() {
        log('connecting to mongodb');
        try {
            connectors.main = yield MongoClient.connect(`mongodb://${settings.db.host}:${settings.db.port}/fs`);
            connectors.users = yield main.createCollection('users');
            connectors.files = yield main.createCollection('files');
            connectors.directories = yield main.createCollection('directories');

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

            let keys = Object.keys(connectors);
            for(let k of keys) {
                Object.defineProperty(self,k,{
                    get: () => {
                        return connectors[k];
                    },
                    set: () => {},
                    configurable: false,
                    enumerable: false
                });
            }

            ready = true;
            self.emit('ready');

            logger.tStop('mongo_startup');
            log('ready, time:',logger.tResults('mongo_startup'));
            logger.tClear('mongo_startup');
        } catch(err) {
            error(err.message);
            logger.tStop('mongo_startup');
            logger.tClear('mongo_startup');
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
