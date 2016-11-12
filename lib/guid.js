const crypto = require('crypto');

function GUID() {

	this.genID = function(len) {
		let gen = crypto.randomBytes(len);
		return gen.toString('hex');
	};

}

module.exports = GUID;
/*
for(let c = 0; c < 50; ++c) {
    let num = 1 + Math.random();
    let mult = num * 0xffffffffffffffff;
    let base36 = mult.toString(16);
    let csprng = crypto.randomBytes(16);
    let str = csprng.toString('hex');
    log(`\nresult:
        num:    ${num}
        mult:   ${mult}
        base36: ${base36}\ncrypto result:
        len:    ${csprng.length}
        str:    ${str}
        str.len:${str.length}`);
}

*/
