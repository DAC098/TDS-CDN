const fs = require('fs');
const path = require('path');

exports.retrieveFolder = function retrieveFolder(root,url) {
    console.log('root:',root,'\nurl:',url);

    try {

        var status = fs.statSync(root);

        if(status.isDirectory()) {

            var list = fs.readdirSync(root);
            var rtn = [];

            for(const item of list) {
                var item_stat = fs.statSync(path.join(root,item));
                var item_url = (path.join('/fs',url,item)).replace(/\\/g,'/');
                console.log('item_url:',item_url);
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

            return undefined;

        }
    } catch(err) {
        console.log('error when reading directory:',err.message);
        throw new Error('read-dir-error');
    }
}

exports.check = function check(root,lookup_path,check_if_file = true) {
    lookup_path = path.join(root,lookup_path);
    console.log('searching for:',lookup_path);
    console.log(`check_if_file: ${check_if_file}`);
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
