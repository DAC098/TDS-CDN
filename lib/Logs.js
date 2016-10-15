const util = require('util');
const path = require('path');
const fs = require('fs');

function Logs(directory,options = {}) {

    const self = this;

    const start = process.hrtime();

    let today = new Date();

    var timers = {};

    const file_log_name = `log_${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}T${pad(today.getHours())}-${today.getMinutes()}-${today.getSeconds()}.log`;

    const fd = (options.file) ? fs.openSync(path.join(directory,file_log_name),'w') : null;

    try {
        let status = fs.statSync(directory);
        if(!status.isDirectory()) {
            // stuff here to handle
        }
    } catch(er) {
        if(er.code === 'ENOENT') {
            fs.mkdir(directory,(err) => {
                if(err) {
                    console.log('ERROR: problem when making log dir:',err.message);
                }
            });
        }
    }

    if(options.file) {
        fd = fs.openSync(path.join(directory,file_log_name),'w');
    }

    function pad(num,lead_zeros = 1) {
        let rtn = `${num}`;
        let fill = lead_zeros + 1 - rtn.length;
        for(let c = 0; c < fill; ++c) {
            rtn = `0${rtn}`;
        }
        return rtn;
    }

    this.currentTime = () => {
        let today = new Date();
        return `${pad(today.getHours())}:${pad(today.getMinutes())}:${pad(today.getSeconds())}.${pad(today.getMilliseconds(),2)}-${today.getTimezoneOffset()}`;
    }

    this.today = () => {
        let today = new Date();
        return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    }

    this.now = (time) => {
        let now = process.hrtime((time) ? time : start);
        let ms = Math.floor(now[1]/1000000);
        let sec = now[0] % 60;
        let min = Math.floor(now[0] / 60 % 60);
        let hr = Math.floor(now[0] / 60 / 60 % 60);
        return `${pad(hr)}:${pad(min)}:${pad(sec)}.${pad(ms,2)}`;
    }

    this.appendLogFile = function(array) {
        let data = '';
        for(const value of array) {
            let type = typeof value;
            if(type === 'string' || type === 'number' || type === 'boolean') {
                data += `${value}`;
            }
            if(value instanceof Array || value instanceof Object) {
                data += `${util.inspect(value)}`;
            }
        }
        fs.write(fd,`${data}\n`,(err,written,string) => {
            if(err) {
                console.log('ERROR: write to file failed,',err.message);
            }
        });
    }

    this.makeLogger = function(name) {
        return function(...args) {
            let parent = self;
            if(options.console) {
                console.log.apply(null,[`[${parent.now()}-${name}]:`,...args]);
            }
            if(options.file) {
                parent.appendLogFile([`[${parent.today()}T${parent.currentTime()}-${name}]:`,...args]);
            }
        }
    }

    this.closeLog = () => {
        fs.closeSycn(fd);
    }

    this.startTimer = (name) => {
        timers[name] = {start: process.hrtime(),stopped:false}
    }

    this.getTimer = (name) => {
        return (name in timers) ? self.now(timers[name].start) : '';
    }

    this.stopTimer = (name) => {
        if(name in timers) {
            timers[name].stopped = true;
            timers[name].end = process.hrtime();
        } else {
            console.log(name,'does not exist');
        }
    }

    this.timerResults = (name) => {
        if(name in timers && timers[name].stopped) {
            let t_start = timers[name].start;
            let t_end = timers[name].end;

            let ms = Math.floor(t_end[1]/1000000) - Math.floor(t_start[1]/1000000);
            let sec = (t_end[0] % 60) - (t_start[0] % 60);
            let min = Math.floor(t_end[0] / 60 % 60) - Math.floor(t_start / 60 % 60);
            let hr = Math.floor(t_end[0] / 60 / 60 % 60) - Math.floor(t_start / 60 / 60 % 60);
            return `${(hr) ? pad(hr) : pad(0)}:${(min) ? pad(min) : pad(0)}:${pad(sec)}.${pad(ms,2)}`;
        } else {
            if(!(name in timers)) {
                console.log(name,'does not exist');
            }
            if(name in timers && !timers[name].stopped) {
                console.log(name,'is still running, stop the timer first');
            }
        }
    }
}

module.exports = Logs;
