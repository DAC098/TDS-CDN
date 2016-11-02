const crypto = require('crypto');

const log = require('./logging.js').makeLogger('crypt');

const HASH = 'sha512';
const ENCODING = 'utf-8';
const BASE = 'base64';

exports.getSalt = () => {
    let buffer = crypto.randomBytes(256);
    return buffer.toString(BASE);
};

exports.getHash = (str,salt) => {
    try {
        let hash = crypto.createHmac(HASH,salt);
        hash.update(str);
        return hash.digest(BASE);
    } catch(err) {
        log('ERROR: creating hash:',err.message);
        return undefined;
    }
};
