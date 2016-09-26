const fs = require('fs');
const path = require('path');

const log = require('../logging.js').makeLogger('FS');

exports.retrieveFolder = function retrieveFolder(root,url) {
    log('retrieveFolder\n    root:',root,'\n    url:',url);

    try {

        var status = fs.statSync(root);

        if(status.isDirectory()) {

            var list = fs.readdirSync(root);
            var rtn = [];

            for(const item of list) {
                var item_stat = fs.statSync(path.join(root,item));
                var item_url = (path.join(url,item)).replace(/\\/g,'/');
                if(item_stat.isFile() || item_stat.isDirectory()) {
                    rtn.push({
                        type: (item_stat.isFile()) ? 'file' : ((item_stat.isDirectory()) ? 'dir' : 'unknown'),
                        name: item,
                        url: item_url,
                        size: item_stat.size,
                        mtime: item_stat.mtime
                    });
                }
            }

            rtn = rtn.sort((a,b) => {
                if(a.type === 'dir' && b.type === 'file') {
                    return -1;
                } else if(a.type === 'file' && b.type === 'dir') {
                    return 1
                } else if(a.type === b.type) {
                    return a.name.localeCompare(b.name,{sensitivity:'case',numeric:true});
                }
            });

            log('return list, count:',rtn.length);

            return rtn;

        } else {

            return undefined;

        }
    } catch(err) {
        log('error when reading directory:',err.message);
        return undefined;
    }
}

exports.retrieveFile = function retrieveFile(root,url) {
    log(`retrieveFile\n    root: ${root}\n    url: ${url}`);

    try {
        var status = fs.statSync(root);
        if(status.isFile()) {
            var file_path = path.parse(root);
            return {
                name: file_path.name,
                ext: file_path.ext,
                base: file_path.base,
                size: status.size,
                birthtime: status.birthtime,
                mtime: status.mtime,
                download: (path.join('/cdn',url)).replace(/\\/g,'/')
            }
        } else {
            return undefined;
        }
    } catch(err) {
        log('error when getting file data:',err.message);
        return undefined;
    }
}

exports.createFile = function createFile(dir,name,data) {
    return new Promise(function(resolve,reject) {
        let write_location = path.join(dir,name);
        log('creating file',write_location);
        fs.writeFile(write_location,data,(err) => {
            if(err) {
                log('ERROR: writing file,',write_location,':',err.message);
                reject();
            } else {
                log('write complete for,',write_location);
                resolve();
            }
        });
    });
}

exports.removeFile = function removeFile(dir) {
    return new Promise(function(resolve,reject) {
        log('removing file',dir);
        fs.unlink(dir,(err) => {
            if(err) {
                log('ERROR: removing file,',dir,':',err.message);
                reject();
            } else {
                log('removed file',dir);
                resolve();
            }
        });
    });
}

exports.createDirectory = function createDirectory(dir) {
    return new Promise(function(resolve,reject) {
        fs.mkdir(dir,(err) => {
            if(err) {
                log('ERROR: making dir,',dir,':',err.message);
                reject();
            } else {
                log('made dir',dir);
                resolve();
            }
        });
    });
}

exports.removeDirectory = function removeDirectory(dir) {
    return new Promise(function(resolve,reject) {
        fs.rmdir(dir,(err) => {
            if(err) {
                log('ERROR: removing dir:',dir,':',err.message);
                reject();
            } else {
                log('removed dir',dir);
                resolve();
            }
        });
    });
}

exports.checkIfDirNotEmpty = function checkIfDirNotEmpty(dir) {
    return new Promise(function(resolve,reject) {
        try {
            let stats = fs.statSync(dir);
            if(stats.isDirectory()) {
                fs.readdir(dir,(err,files) => {
                    if(err) {
                        log('ERROR: reading dir,',dir,':',err.message);
                        reject();
                    } else {
                        resolve(files.length);
                    }
                });
            } else {
                reject();
            }
        } catch(err) {
            log('ERROR: status of dir,',dir,':',err.message);
            reject();
        }
    });
}

exports.checkExists = function checkExists(check_file,...paths) {
    let lookup = path.join(...paths);
    let str = (check_file) ? 'file' : 'directory';
    log('checking if',str,'exists\npath:',lookup);
    return new Promise(function(resolve,reject) {
        fs.stat(lookup,(err,stats) => {
            if(err) {
                if(err.code === 'ENOENT') {
                    resolve(false);
                } else {
                    log('ERROR: status of',str,'- code',err.code,':',err.message);
                    reject();
                }
            } else {
                resolve( (check_file && stats.isFile()) || (!check_file && stats.isDirectory()) );
            }
        });
    });
}

exports.check = function check(check_if_file,...paths) {
    let lookup_path = path.join(...paths);
    log('searching for:',lookup_path);
    log(`check_if_file: ${check_if_file}`);
    try {
        var status = fs.statSync(lookup_path);
        if(check_if_file && status.isFile()) {
            return lookup_path;
        }
        if(!check_if_file && status.isDirectory()) {
            return lookup_path;
        }
        return undefined;
    } catch(err) {
        return undefined;
    }
}
