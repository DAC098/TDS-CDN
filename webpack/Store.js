function Store() {

	var is_set = typeof window !== 'undefined';

	var ss = (is_set) ? window.sessionStorage : null;

	var ls = (is_set) ? window.localStorage : null;

	this.get = function get(key,use_ss = true) {
		if(is_set) {
			if(use_ss || typeof use_ss === 'undefined') {
				return ss.getItem(key);
			} else {
				return ls.getItem(key);
			}
		}
	};

	this.set = function set(key,value,use_ss = true) {
		if(is_set) {
			if(use_ss || typeof use_ss === 'undefined') {
				ss.setItem(key,value);
			} else {
				ls.setItem(key,value);
			}
		}
	};

	this.remove = function remove(key,use_ss = true) {
		if(is_set) {
			if(use_ss || typeof use_ss === 'undefined') {
				ss.removeItem(key);
			} else {
				ls.removeItem(key);
			}
		}
	};

	this.clear = function clear(use_ss = true) {
		if(is_set) {
			if(use_ss || typeof use_ss === 'undefined') {
				ss.clear();
			} else {
				ls.clear();
			}
		}
	};
}

module.exports = new Store();
