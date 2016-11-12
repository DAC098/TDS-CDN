const co = require('co');

module.exports = function wrap(gen) {

	let fn = co.wrap(gen);

	if(gen.length === 4) {
		return function(err,req,res,next) {
			let isParam = !(err instanceof Error);
			let callNextRoute = next;
			if(isParam) {
				callNextRoute = res;
			}
			return fn(err,req,res,next).catch(callNextRoute);
		};
	}

	return function(req,res,next) {
		return fn(req,res,next).catch(next);
	};
	
};
