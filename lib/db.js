const events = require('events');

const MongoClient = require('mongodb').MongoClient;
const co = require('co');

const settings = require('../settings.json');
const logger = require('./logging.js');
const log = logger.makeLogger('db');

const db = function db() {

    logger.startTimer('mongo_startup');

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

            logger.stopTimer('mongo_startup');
            log('ready, time:',logger.timerResults('mongo_startup'));
            logger.clearTimer('mongo_startup');
        } catch(err) {
            log('ERROR:',err.message);
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
