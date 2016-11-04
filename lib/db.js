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

    var ready = false;

    co(function*() {
        log('connecting to mongodb');
        try {
            main = yield MongoClient.connect(`mongodb://${settings.db.host}:${settings.db.port}/fs`);
            users = yield main.createCollection('users');

            Object.defineProperty(self,'main',{
                get: function() {
                    return main;
                },
                set: function() {}
            });

            Object.defineProperty(self,'users',{
                get: function() {
                    return users;
                },
                set: function() {}
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
