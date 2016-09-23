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
                download: (path.join('/cdn',url)).replace('\\','/')
            }
        } else {
            return undefined;
        }
    } catch(err) {
        log('error when getting file data:',err.message);
        return undefined;
    }
}

exports.check = function check(check_if_file,...paths) {
    lookup_path = path.join(...paths);
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
