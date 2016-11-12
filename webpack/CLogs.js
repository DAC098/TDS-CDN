var {padStart} = require('../lib/misc.js');

function CLogs() {

	var self = this;

	var start = Date.now();

	this.now = function now() {
		let now = Date.now() - start;
		let ms = now % 1000;
		let sec = Math.floor(now / 1000 % 60);
		let min = Math.floor(now / 1000 / 60 % 60);
		let hr = Math.floor(now / 1000 / 60 / 60 % 60);
		return `${padStart(hr,2,'0')}:${padStart(min,2,'0')}:${padStart(sec,2,'0')}.${padStart(ms,3,'0')}`;
	};

	this.makeLogger = function makeLogger(name) {
		return function(...args) {
			var parent = self;
			console.log.apply(null,[`[${parent.now()}-${name}]:`,...args]);
		};
	};

}

var exp = new CLogs();

module.exports = exp;
