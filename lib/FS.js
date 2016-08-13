const fs = require('fs');
const path = require('path');

exports.retrieveFolder = function retrieveFolder(root,dir_path) {
    console.log('root:',root,'\ndir_path:',dir_path);
    dir_path = (dir_path) ? dir_path : '';
    var check = path.join(root,dir_path);

    try {

        var status = fs.statSync(check);

        if(status.isDirectory()) {

            var sys_path = path.join(root,dir_path);
            var list = fs.readdirSync(sys_path);
            var rtn = [];

            for(const item of list) {
                var item_stat = fs.statSync(path.join(sys_path,item));
                var item_path = path.parse(path.join(sys_path,item));
                var item_url = (path.join('/',dir_path,item)).replace(/\\/g,'/');
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

            return rtn;

        } else {

            return []

        }
    } catch(err) {
        console.log('error when reading directory:',err.message);
        return [];
    }
}

exports.check = function check(root,lookup_path) {
    lookup_path = path.join(root,lookup_path);
    console.log('searching for:',lookup_path);
    try {
        var status = fs.statSync(lookup_path);
        if(status.isFile()) {
            return lookup_path;
        }
    } catch(err) {
        return undefined;
    }
}
