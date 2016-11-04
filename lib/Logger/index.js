const {Console} = require('console');
const fs = require('fs');
const assert = require('assert');
const path = require('path');

function pad(num,lead_zeros = 1) {
        let rtn = `${num}`;
        let fill = lead_zeros + 1 - rtn.length;
        for(let c = 0; c < fill; ++c) {
            rtn = `0${rtn}`;
        }
        return rtn;
    };

function Logger(options = {}) {
    this.cwd = process.cwd();
    this.start = process.hrtime();
    this.dir = (options.dir && typeof options.dir === 'string') ? options.dir : path.join(this.cwd,'logs');
    this.timers = {};
    this.options = options;

    try {
        let stats = fs.statSync(this.dir);
    } catch(err) {
        if(err.code === 'ENOENT') {
            fs.mkdirSync(this.dir);
        }
    }

    let today = new Date();
    let file_name = `${today.getFullYear()}${pad(today.getMonth() - 1)}${pad(today.getDate())}T${pad(today.getHours())}${pad(today.getMinutes())}${pad(today.getSeconds())}`;
    let log_file = path.join(this.dir,file_name+'.log');
    let err_file = path.join(this.dir,file_name+'.err.log');

    let fout = fs.createWriteStream(log_file,{flag:'a'});
    let ferr = fs.createWriteStream(err_file,{flag:'a'});

    this.file = new Console(fout,ferr);
}

Logger.prototype.dTime = function dTime() {
    let today = new Date();
    return `${pad(today.getHours())}:${pad(today.getMinutes())}:${pad(today.getSeconds())}.${pad(today.getMilliseconds(),2)}`;
};

Logger.prototype.today = function today() {
    let today = new Date();
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
};

Logger.prototype.pTime = function pTime(time) {
    let now = (time) ? time : process.hrtime(this.start);
    let ms = Math.floor(now[1]/1000000);
    let sec = now[0] % 60;
    let min = Math.floor(now[0] / 60 % 60);
    let hr = Math.floor(now[0] / 60 / 60 % 60);
    return `${pad(hr)}:${pad(min)}:${pad(sec)}.${pad(ms,2)}`;
};

Logger.prototype.makeLog = function makeLog(name,prefix = '',is_err = false) {
    let self = this;
    return (...args) => {
        if(this.options.console) {
            let tmp = [...args];
            tmp.unshift(`[${this.pTime()}-${name}]${prefix}:`);
            let send = (is_err) ? console.error : console.log;
            send.apply(null,tmp);
        }
        if(this.options.file) {
            let tmp = [...args];
            tmp.unshift(`[${this.today()}T${this.dTime()}-${name}]${prefix}:`);
            let send = (is_err) ? this.file.error : this.file.log;
            send.apply(null,tmp);
        }
    };
};

Logger.prototype.tStart = function tStart(name) {
    this.timers[name] = {
        start: process.hrtime(),
        end: [],
        stopped: false
    };
};

Logger.prototype.tGet = function tGet(name,number = false) {
    if(name in this.timers) {
        let now = process.hrtime(this.timers[name].start);
        return (number) ? now : this.pTime(now);
    } else {
        throw new Error(`${name} does not exist`);
    }
};

Logger.prototype.tStop = function tStop(name) {
    if(name in this.timers) {
        this.timers[name].stopped = true;
        this.timers[name].end = process.hrtime(this.timers[name].start);
    } else {
        throw new Error(`${name} does not exist`);
    }
};

Logger.prototype.tResults = function tResults(name) {
    if(name in this.timers) {
        if(this.timers[name].stopped) this.tStop(name);
        return this.pTime(this.timers[name].end);
    } else {
        throw new Error(`${name} does not exist`);
    }
};

Logger.prototype.tClear = function tClear(name) {
    if(name in this.timers) {
        this.timers[name] = {
            start: [],
            end: [],
            stopped: false
        };
    } else {
        throw new Error(`${name} does not exist`);
    }
};

Logger.prototype.tDelete = function tDelete(name) {
    if(name in this.timers) {
        delete this.timers[name];
    } else {
        throw new Error(`${name} does not exist`);
    }
};

module.exports.Logger = Logger;
module.exports = function(options) {
    return new Logger(options);
};
