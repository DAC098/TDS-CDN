exports.joinPath = function joinPath(paths = []) {
    if(typeof paths === 'undefined' || paths.length === 0) {
        return '/';
    }
    let str = '';
    let len = paths.length;
    for(let c = 0; c < len; ++c) {
        paths[c] = (paths[c]) ? paths[c].replace('/','') : '';
        str = (paths[c] !== '') ? `${str}/${paths[c]}` : str;
    }
    return str;
};

exports.splitPath = function splitPath(str) {
    let rtn = str.split('/');
    let len = rtn.length,
        c = 0;
    while(c < len) {
        if(rtn[c] === '') {
            rtn.shift();
            --len;
        } else {
            ++c;
        }
    }
    return rtn;
};
